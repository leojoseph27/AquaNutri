"""
AQUANUTRI - Flask Inference API (Mini Service)
==============================================
Implements the Flask-based API service described in section 3.A of the paper:

    "The AQUANUTRI system comprises a smartphone-friendly visual interface
     and a Flask-based API service, powered by a customized ResNet50 model
     trained on DermNet data."

The service exposes:

    POST /predict        - accepts a skin image, returns ranked deficiency
                           predictions with confidence scores.
    GET  /health         - liveness probe.
    GET  /classes        - returns the list of classes the model knows.
    GET  /history        - returns the model training accuracy/loss curve
                           (used for the Fig. 7 chart in the UI).

Runs on port 5001. The Next.js gateway proxies to it via XTransformPort=5001.
"""
from __future__ import annotations

import io
import json
import os
import sys
from pathlib import Path

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import tensorflow as tf

tf.get_logger().setLevel("ERROR")

# --------------------------------------------------------------------------
# Configuration
# --------------------------------------------------------------------------
# Resolve model directory relative to this file, with env override for Docker.
# In dev: /home/z/my-project/ml/models
# In Docker: /app/ml/models
_HERE = Path(__file__).resolve().parent
_PROJECT_ROOT = _HERE.parent.parent  # mini-services/skin-api -> project root
MODEL_DIR   = Path(os.environ.get("AQUANUTRI_MODEL_DIR",
                                   str(_PROJECT_ROOT / "ml" / "models")))
MODEL_PATH  = MODEL_DIR / "aquanutri_resnet50.h5"
CLASSES     = MODEL_DIR / "class_indices.json"
HISTORY     = MODEL_DIR / "training_history.json"
IMG_SIZE    = (224, 224)
PORT        = int(os.environ.get("FLASK_PORT", "5001"))

# Map raw model class names to human-friendly deficiency metadata.
DEFICIENCY_META = {
    "iron_deficiency": {
        "label": "Iron Deficiency",
        "nutrient": "Iron",
        "description": "Reduced hemoglobin production causing pale skin, fatigue, and brittle nails. Often visible as conjunctival pallor or unusually light skin tone compared to baseline.",
        "symptoms": ["Pallor", "Fatigue", "Brittle nails", "Cold hands/feet"],
        "severity_thresholds": {"mild": 0.55, "moderate": 0.72, "severe": 0.85},
    },
    "vitamin_b12_deficiency": {
        "label": "Vitamin B12 Deficiency",
        "nutrient": "Vitamin B12",
        "description": "Megaloblastic anemia with jaundice-like yellowing, hyperpigmentation, and glossitis. Skin may appear sallow or yellow-tinted.",
        "symptoms": ["Jaundice", "Hyperpigmentation", "Glossitis", "Fatigue"],
        "severity_thresholds": {"mild": 0.55, "moderate": 0.72, "severe": 0.85},
    },
    "vitamin_d_deficiency": {
        "label": "Vitamin D Deficiency",
        "nutrient": "Vitamin D",
        "description": "Impaired calcium metabolism causing dry, scaly, itchy skin. Severe deficiency can manifest as rashes and impaired wound healing.",
        "symptoms": ["Dry scaly skin", "Itching", "Slow healing", "Muscle weakness"],
        "severity_thresholds": {"mild": 0.55, "moderate": 0.72, "severe": 0.85},
    },
    "zinc_deficiency": {
        "label": "Zinc Deficiency",
        "nutrient": "Zinc",
        "description": "Acrodermatitis enteropathica - characteristic erythematous, scaly rashes around extremities and orifices. Impaired wound healing.",
        "symptoms": ["Erythematous rash", "Slow wound healing", "Hair loss", "Diarrhea"],
        "severity_thresholds": {"mild": 0.55, "moderate": 0.72, "severe": 0.85},
    },
    "vitamin_a_deficiency": {
        "label": "Vitamin A Deficiency",
        "nutrient": "Vitamin A",
        "description": "Follicular hyperkeratosis - rough, bumpy skin (phrynoderma) especially on thighs and arms. Night blindness often accompanies skin changes.",
        "symptoms": ["Follicular hyperkeratosis", "Dry rough skin", "Night blindness", "Poor wound healing"],
        "severity_thresholds": {"mild": 0.55, "moderate": 0.72, "severe": 0.85},
    },
    "healthy": {
        "label": "No Deficiency Detected",
        "nutrient": "None",
        "description": "Skin appearance is within normal parameters. Continue maintaining a balanced, nutrient-rich diet.",
        "symptoms": [],
        "severity_thresholds": {},
    },
}


# --------------------------------------------------------------------------
# Load model + class map
# --------------------------------------------------------------------------
print(f"[api] loading model from {MODEL_PATH} ...", flush=True)
if not MODEL_PATH.exists():
    print(f"[api] FATAL: model file not found at {MODEL_PATH}", flush=True)
    sys.exit(1)

model = tf.keras.models.load_model(MODEL_PATH)
print("[api] model loaded.", flush=True)

idx_to_class = {}
if CLASSES.exists():
    name_to_idx = json.loads(CLASSES.read_text())
    idx_to_class = {v: k for k, v in name_to_idx.items()}
else:
    print("[api] WARN: class_indices.json missing", flush=True)

app = Flask(__name__)
CORS(app)


# --------------------------------------------------------------------------
# Routes
# --------------------------------------------------------------------------
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "classes": list(idx_to_class.values())})


@app.route("/classes", methods=["GET"])
def classes():
    return jsonify({"classes": list(idx_to_class.values())})


@app.route("/history", methods=["GET"])
def history():
    if HISTORY.exists():
        return jsonify(json.loads(HISTORY.read_text()))
    return jsonify({})


@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "no image uploaded"}), 400

    file = request.files["image"]
    try:
        img = Image.open(io.BytesIO(file.read())).convert("RGB")
    except Exception as e:
        return jsonify({"error": f"invalid image: {e}"}), 400

    # Preprocess
    img = img.resize(IMG_SIZE)
    arr = np.array(img, dtype=np.float32)
    arr = tf.keras.applications.resnet50.preprocess_input(arr)
    arr = np.expand_dims(arr, axis=0)

    # Inference
    preds = model.predict(arr, verbose=0)[0]

    # Build ranked prediction list
    ranked = []
    for idx, prob in enumerate(preds):
        cls = idx_to_class.get(idx, str(idx))
        meta = DEFICIENCY_META.get(cls, {})
        ranked.append({
            "class": cls,
            "label": meta.get("label", cls),
            "confidence": float(prob),
            "nutrient": meta.get("nutrient", ""),
            "description": meta.get("description", ""),
            "symptoms": meta.get("symptoms", []),
        })
    ranked.sort(key=lambda x: x["confidence"], reverse=True)

    top = ranked[0]
    # Determine severity (skip for "healthy")
    severity = "none"
    if top["class"] != "healthy":
        thr = DEFICIENCY_META.get(top["class"], {}).get("severity_thresholds", {})
        if top["confidence"] >= thr.get("severe", 0.85):
            severity = "severe"
        elif top["confidence"] >= thr.get("moderate", 0.72):
            severity = "moderate"
        elif top["confidence"] >= thr.get("mild", 0.55):
            severity = "mild"
        else:
            severity = "minimal"

    # Also collect other flags above 0.3 - secondary deficiencies
    secondary = [
        {"class": r["class"], "label": r["label"], "confidence": r["confidence"]}
        for r in ranked[1:6] if r["class"] != "healthy" and r["confidence"] > 0.30
    ]

    return jsonify({
        "top": top,
        "severity": severity,
        "secondary": secondary,
        "all": ranked,
        "model": "ResNet50 (AQUANUTRI fine-tuned)",
    })


if __name__ == "__main__":
    print(f"[api] starting on port {PORT}", flush=True)
    app.run(host="0.0.0.0", port=PORT, debug=False, threaded=True)
