"""
AQUANUTRI - ResNet50 Training Pipeline
======================================
Implements the model training pipeline described in section 3.B of the paper:

    "The ResNet50 model employed in AQUANUTRI was fine-tuned using transfer
     learning on the DermNet dataset, with a specific focus on symptoms related
     to nutritional deficiencies. Data augmentation techniques were applied to
     enhance model generalization and robustness. The training pipeline included
     iterative validation and optimization steps to improve accuracy and
     reliability."

Pipeline stages:
  1. Load ResNet50 pre-trained on ImageNet (transfer learning base).
  2. Freeze the convolutional base, attach a custom classification head.
  3. Train the head with heavy data augmentation.
  4. Fine-tune the top ResNet50 block for a few epochs.
  5. Evaluate on a held-out validation set, log accuracy/loss curves.
  6. Save the trained model + class index mapping for the inference service.

Outputs:
  - ml/models/aquanutri_resnet50.h5        trained Keras model
  - ml/models/class_indices.json           class-name <-> integer index map
  - ml/models/training_history.json        accuracy / loss per epoch (for the
                                            accuracy/loss curve in Fig. 7)
"""
from __future__ import annotations

import json
import os
from pathlib import Path

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"            # silence TF chatter
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models, optimizers
from tensorflow.keras.applications import ResNet50
from tensorflow.keras.preprocessing import image_dataset_from_directory

# --------------------------------------------------------------------------
# Configuration
# --------------------------------------------------------------------------
DATA_DIR   = Path("/home/z/my-project/ml/data/skin")
MODEL_DIR  = Path("/home/z/my-project/ml/models")
MODEL_DIR.mkdir(parents=True, exist_ok=True)

IMG_SIZE        = (224, 224)
BATCH_SIZE      = 16
HEAD_EPOCHS     = 2           # train classifier head
FINETUNE_EPOCHS = 1           # fine-tune top ResNet block
VAL_SPLIT       = 0.2
SEED            = 42

tf.get_logger().setLevel("ERROR")
np.random.seed(SEED)
tf.random.set_seed(SEED)


# --------------------------------------------------------------------------
# 1. Data pipelines with augmentation
# --------------------------------------------------------------------------
def build_datasets():
    augmentation = tf.keras.Sequential([
        layers.RandomFlip("horizontal"),
        layers.RandomRotation(0.10),
        layers.RandomZoom(0.10),
        layers.RandomContrast(0.10),
        layers.RandomBrightness(0.10),
    ], name="augmentation")

    train_ds = image_dataset_from_directory(
        DATA_DIR,
        validation_split=VAL_SPLIT,
        subset="training",
        seed=SEED,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        label_mode="categorical",
    )
    val_ds = image_dataset_from_directory(
        DATA_DIR,
        validation_split=VAL_SPLIT,
        subset="validation",
        seed=SEED,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        label_mode="categorical",
    )

    class_names = train_ds.class_names
    print(f"[train] classes: {class_names}")

    # ResNet50 preprocessing (RGB -> BGR mean-centred) is built into the
    # preprocess_input helper - chain it after augmentation.
    preprocess = tf.keras.applications.resnet50.preprocess_input

    train_ds = train_ds.shuffle(buffer_size=200, seed=SEED, reshuffle_each_iteration=True).map(
        lambda x, y: (preprocess(augmentation(x)), y),
        num_parallel_calls=tf.data.AUTOTUNE,
    ).prefetch(tf.data.AUTOTUNE)
    val_ds = val_ds.map(
        lambda x, y: (preprocess(x), y),
        num_parallel_calls=tf.data.AUTOTUNE,
    ).prefetch(tf.data.AUTOTUNE)
    return train_ds, val_ds, class_names


# --------------------------------------------------------------------------
# 2. Build the transfer-learning model
# --------------------------------------------------------------------------
def build_model(num_classes: int):
    base = ResNet50(
        include_top=False,
        weights="imagenet",
        input_shape=(*IMG_SIZE, 3),
    )
    base.trainable = False        # freeze during head training

    inputs = tf.keras.Input(shape=(*IMG_SIZE, 3))
    x = base(inputs, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dropout(0.4)(x)
    x = layers.Dense(256, activation="relu")(x)
    x = layers.Dropout(0.3)(x)
    outputs = layers.Dense(num_classes, activation="softmax")(x)
    model = models.Model(inputs, outputs, name="aquanutri_resnet50")
    return model, base


# --------------------------------------------------------------------------
# 3. Training orchestration
# --------------------------------------------------------------------------
def main():
    train_ds, val_ds, class_names = build_datasets()
    num_classes = len(class_names)

    model, base = build_model(num_classes)

    # --- Stage A: train the classification head ---
    model.compile(
        optimizer=optimizers.Adam(learning_rate=1e-3),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )
    print("[train] stage A: training classifier head")
    hist_a = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=HEAD_EPOCHS,
        verbose=2,
    )

    # --- Stage B: fine-tune the top ResNet50 block ---
    print("[train] stage B: fine-tuning top ResNet50 block")
    base.trainable = True
    for layer in base.layers[:-20]:       # freeze all but last 20 layers
        layer.trainable = False

    model.compile(
        optimizer=optimizers.Adam(learning_rate=1e-5),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )
    hist_b = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=FINETUNE_EPOCHS,
        verbose=2,
    )

    # --- Evaluate ---
    val_loss, val_acc = model.evaluate(val_ds, verbose=0)
    print(f"[train] final validation accuracy: {val_acc:.4f}  loss: {val_loss:.4f}")

    # --- Save model + metadata ---
    model_path = MODEL_DIR / "aquanutri_resnet50.h5"
    model.save(model_path)
    print(f"[train] model saved to {model_path}")

    class_indices = {name: idx for idx, name in enumerate(class_names)}
    (MODEL_DIR / "class_indices.json").write_text(
        json.dumps(class_indices, indent=2)
    )

    history = {
        "stage_a": {
            "accuracy":      [float(x) for x in hist_a.history["accuracy"]],
            "val_accuracy":  [float(x) for x in hist_a.history["val_accuracy"]],
            "loss":          [float(x) for x in hist_a.history["loss"]],
            "val_loss":      [float(x) for x in hist_a.history["val_loss"]],
        },
        "stage_b": {
            "accuracy":      [float(x) for x in hist_b.history["accuracy"]],
            "val_accuracy":  [float(x) for x in hist_b.history["val_accuracy"]],
            "loss":          [float(x) for x in hist_b.history["loss"]],
            "val_loss":      [float(x) for x in hist_b.history["val_loss"]],
        },
        "final_val_accuracy": float(val_acc),
        "final_val_loss":     float(val_loss),
        "class_names":        class_names,
    }
    (MODEL_DIR / "training_history.json").write_text(json.dumps(history, indent=2))
    print("[train] history saved to ml/models/training_history.json")


if __name__ == "__main__":
    main()
