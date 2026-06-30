"""
AQUANUTRI - Dataset Generation Script
======================================
Generates a synthetic skin-condition dataset that mirrors the structure of the
DermNet skin-condition dataset (one folder per class of images). Each class
represents a nutritional deficiency whose visible dermal symptoms are well
documented in clinical literature (see paper references [5], [6], [9]).

The synthetic images are generated programmatically with realistic skin-tone
colour palettes plus the characteristic visual pattern of each deficiency:

  - iron_deficiency          : pallor / pale conjunctiva-like tone
  - vitamin_b12_deficiency   : yellowish / jaundiced hyperpigmentation
  - vitamin_d_deficiency     : dry, scaly, flaky patches
  - zinc_deficiency          : acrodermatitis-like erythematous rash
  - vitamin_a_deficiency     : follicular hyperkeratosis (rough, hyperkeratotic)
  - healthy                  : normal varied skin tone

The directory layout produced is:

    ml/data/skin/<class_name>/img_xxx.jpg

This is exactly the layout the ResNet50 training pipeline expects, so swapping
in real DermNet images later only requires replacing the contents of
`ml/data/skin/` with real images arranged in the same per-class folders.
"""
from __future__ import annotations

import os
import random
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

# --------------------------------------------------------------------------
# Configuration
# --------------------------------------------------------------------------
ROOT = Path("/home/z/my-project/ml/data/skin")
IMG_SIZE = 224                       # ResNet50 input size
IMAGES_PER_CLASS = 80                # compact dataset for fast CPU training
SEED = 42

random.seed(SEED)
np.random.seed(SEED)

# --------------------------------------------------------------------------
# Skin-tone base palettes (RGB).  Multiple tones per class so the model
# learns deficiency patterns independent of base complexion.
# --------------------------------------------------------------------------
BASE_TONES = [
    (245, 220, 195),   # very light
    (225, 195, 165),   # light
    (200, 160, 125),   # medium
    (165, 120, 90),    # tan
    (130, 90, 65),     # brown
    (95, 60, 45),      # dark brown
]


# --------------------------------------------------------------------------
# Per-class image generators.  Each produces a 224x224 RGB PIL image that
# resembles skin exhibiting the corresponding deficiency pattern.
# --------------------------------------------------------------------------
def _base_skin(tone):
    """Generate a base skin image with natural texture noise."""
    arr = np.full((IMG_SIZE, IMG_SIZE, 3), tone, dtype=np.float32)
    # subtle texture noise
    noise = np.random.normal(0, 6, arr.shape)
    arr = np.clip(arr + noise, 0, 255)
    # mild gradient to simulate lighting
    yy, xx = np.mgrid[0:IMG_SIZE, 0:IMG_SIZE]
    grad = 1.0 - (xx + yy) / (2 * IMG_SIZE)
    arr = arr * (0.85 + 0.3 * grad[..., None])
    return Image.fromarray(arr.astype(np.uint8))


def _add_patches(img, color, n=3, max_r=45):
    """Add blurred circular patches of a given colour (used for rashes)."""
    draw = ImageDraw.Draw(img)
    for _ in range(n):
        r = random.randint(20, max_r)
        x = random.randint(r, IMG_SIZE - r)
        y = random.randint(r, IMG_SIZE - r)
        draw.ellipse([x - r, y - r, x + r, y + r], fill=color)
    return img.filter(ImageFilter.GaussianBlur(radius=8))


def _add_scales(img, n=400):
    """Add fine scaly texture (vitamin D deficiency - dry skin)."""
    arr = np.array(img).astype(np.int16)
    for _ in range(n):
        y = random.randint(0, IMG_SIZE - 4)
        x = random.randint(0, IMG_SIZE - 4)
        h = random.randint(2, 5)
        w = random.randint(4, 12)
        delta = random.choice([-40, -30, 30, 40])
        arr[y:y + h, x:x + w] = np.clip(arr[y:y + h, x:x + w] + delta, 0, 255)
    return Image.fromarray(arr.astype(np.uint8)).filter(ImageFilter.GaussianBlur(radius=1))


def _add_follicular_bumps(img, n=600):
    """Add follicular hyperkeratotic bumps (vitamin A deficiency)."""
    draw = ImageDraw.Draw(img)
    for _ in range(n):
        x = random.randint(0, IMG_SIZE - 2)
        y = random.randint(0, IMG_SIZE - 2)
        r = random.randint(1, 3)
        c = random.randint(-50, 50)
        col = tuple(np.clip(np.array(img.getpixel((x, y))) + c, 0, 255).astype(int))
        draw.ellipse([x - r, y - r, x + r, y + r], fill=col)
    return img.filter(ImageFilter.GaussianBlur(radius=1.2))


def gen_iron_deficiency():
    """Pallor - significantly lighter than base tone."""
    tone = random.choice(BASE_TONES)
    # lift tone toward pale
    pale = tuple(min(255, int(c + (255 - c) * 0.45)) for c in tone)
    img = _base_skin(pale)
    img = img.filter(ImageFilter.GaussianBlur(radius=2))
    return img


def gen_vitamin_b12_deficiency():
    """Jaundice-like yellow / sallow cast + hyperpigmented patches."""
    tone = random.choice(BASE_TONES)
    img = _base_skin(tone)
    # apply yellow cast
    arr = np.array(img).astype(np.int16)
    arr[..., 0] = np.clip(arr[..., 0] + 25, 0, 255)   # R up
    arr[..., 1] = np.clip(arr[..., 1] + 15, 0, 255)   # G up slightly
    arr[..., 2] = np.clip(arr[..., 2] - 25, 0, 255)   # B down
    img = Image.fromarray(arr.astype(np.uint8))
    # occasional hyperpigmented patch
    if random.random() < 0.7:
        img = _add_patches(img, (130, 80, 50), n=random.randint(1, 3), max_r=35)
    return img


def gen_vitamin_d_deficiency():
    """Dry, scaly, flaky patches on otherwise normal skin."""
    tone = random.choice(BASE_TONES)
    img = _base_skin(tone)
    img = _add_scales(img, n=random.randint(300, 600))
    if random.random() < 0.5:
        img = _add_patches(img, (200, 175, 150), n=random.randint(1, 2), max_r=30)
    return img


def gen_zinc_deficiency():
    """Acrodermatitis-like erythematous rash - reddish patches around extremities."""
    tone = random.choice(BASE_TONES)
    img = _base_skin(tone)
    red = (random.randint(180, 230), random.randint(60, 110), random.randint(60, 110))
    img = _add_patches(img, red, n=random.randint(4, 8), max_r=55)
    return img


def gen_vitamin_a_deficiency():
    """Follicular hyperkeratosis - rough, bumpy skin."""
    tone = random.choice(BASE_TONES)
    img = _base_skin(tone)
    img = _add_follicular_bumps(img, n=random.randint(400, 800))
    return img


def gen_healthy():
    """Healthy varied skin tone with subtle texture."""
    tone = random.choice(BASE_TONES)
    img = _base_skin(tone)
    img = img.filter(ImageFilter.GaussianBlur(radius=1))
    return img


CLASS_GENERATORS = {
    "iron_deficiency": gen_iron_deficiency,
    "vitamin_b12_deficiency": gen_vitamin_b12_deficiency,
    "vitamin_d_deficiency": gen_vitamin_d_deficiency,
    "zinc_deficiency": gen_zinc_deficiency,
    "vitamin_a_deficiency": gen_vitamin_a_deficiency,
    "healthy": gen_healthy,
}


def main():
    print(f"[dataset] generating dataset under {ROOT}")
    ROOT.mkdir(parents=True, exist_ok=True)
    for cls_name, gen in CLASS_GENERATORS.items():
        cls_dir = ROOT / cls_name
        cls_dir.mkdir(parents=True, exist_ok=True)
        for i in range(IMAGES_PER_CLASS):
            img = gen()
            img.save(cls_dir / f"img_{i:03d}.jpg", quality=92)
        print(f"  - {cls_name}: {IMAGES_PER_CLASS} images")
    total = sum(1 for _ in ROOT.rglob("*.jpg"))
    print(f"[dataset] done. total images: {total}")


if __name__ == "__main__":
    main()
