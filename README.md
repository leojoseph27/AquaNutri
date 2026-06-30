---
title: AquaNutri
emoji: 🐟🩺
colorFrom: teal
colorTo: emerald
sdk: docker
app_port: 7860
pinned: true
license: mit
short_description: AI skin deficiency detection + sustainable fish nutrition
tags:
  - ai
  - health
  - aquaculture
  - resnet50
  - tensorflow
  - nextjs
  - nutrition
  - sustainable
  - mhealth
  - skin-analysis
---

# AQUANUTRI 🐟🩺

**AI Skin Deficiency Detection & Sustainable Fish Nutrition Platform**

AQUANUTRI detects nutritional deficiencies from skin images using a fine-tuned **ResNet50** CNN, then recommends nutrient-rich, locally-suitable fish species for sustainable terrace aquaculture.

![Status](https://img.shields.io/badge/val_accuracy-96.88%25-emerald)
![Model](https://img.shields.io/badge/model-ResNet50-teal)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 🌊 What it does

1. **AI Skin Scan** — A fine-tuned ResNet50 CNN analyses dermal patterns associated with 5 nutritional deficiencies (iron, B12, D, zinc, vitamin A) plus a healthy baseline class. Returns confidence scores, severity levels, and a visual heatmap overlay.
2. **Personalized Fish Recommendations** — A 28-species nutrient database (per-100g profiles, water type, region, farming suitability) is filtered by the detected deficiencies + the user's water type, region, and farming capacity. Weighted scoring ranks the best species to close the user's nutrient gap.
3. **Terrace Aquaculture Guide** — Step-by-step guide to setting up a rooftop/balcony fish farm: tank sizing, water quality, feeding, species selection, and weekly maintenance.
4. **Progress Tracking** — Every scan is auto-saved to a per-device timeline with confidence trend charts and the model's training accuracy/loss curves.

---

## 🧠 ML Pipeline

| Stage | Detail |
|-------|--------|
| **Base model** | ResNet50 (ImageNet pre-trained) |
| **Transfer learning** | Stage A: train new classifier head (frozen base) → Stage B: fine-tune top 20 ResNet layers |
| **Input** | 224 × 224 × 3, ResNet50 preprocessing |
| **Augmentation** | Horizontal flip, rotation, zoom, contrast, brightness |
| **Classes** | 6 (iron_deficiency, vitamin_b12_deficiency, vitamin_d_deficiency, zinc_deficiency, vitamin_a_deficiency, healthy) |
| **Final val accuracy** | **96.88%** |
| **Inference** | Flask service on port 5001, ~120ms per image |

### Re-train the model

```bash
# 1. Generate the synthetic skin dataset (480 images, 6 classes)
python3 scripts/01_generate_dataset.py

# 2. Train the ResNet50 model (transfer learning + fine-tune)
python3 scripts/02_train_resnet50.py

# 3. (Already done) Build the fish nutrient database
python3 scripts/03_build_fish_db.py
```

This produces `ml/models/aquanutri_resnet50.h5` + `class_indices.json` + `training_history.json`.

To swap in real DermNet images, replace the contents of `ml/data/skin/<class>/` with real photos arranged in the same per-class folder structure, then re-run step 2.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS 4, shadcn/ui |
| Charts | Recharts |
| Backend API | Next.js API routes (proxy to Flask) |
| Inference service | Flask + TensorFlow 2 / Keras (mini-service on port 5001) |
| ML training | TensorFlow 2 / Keras, ResNet50 |
| Storage | localStorage (per-device scan timeline) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ and [Bun](https://bun.sh)
- Python 3.10+ with `tensorflow`, `flask`, `flask-cors`, `Pillow`, `numpy`, `pandas`

### Install & run

```bash
# 1. Install frontend deps
bun install

# 2. Start the Flask inference service (background)
cd mini-services/skin-api && python3 server.py &

# 3. Start the Next.js dev server
bun run dev
```

Open http://localhost:3000 in your browser.

### Docker (Hugging Face Spaces)

```bash
docker build -t aquanutri .
docker run -p 7860:7860 aquanutri
```

Open http://localhost:7860 in your browser.

---

## 📁 Project Structure

```
.
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── page.tsx                  # Single-page app shell
│   │   ├── layout.tsx
│   │   └── api/                      # API routes
│   │       ├── predict/              # Proxies to Flask inference service
│   │       ├── recommend/            # Fish recommendation engine
│   │       ├── fish-db/              # Full fish nutrient DB
│   │       ├── training-history/     # ResNet50 training curves
│   │       └── scans/                # Scan timeline persistence
│   ├── components/
│   │   ├── ui/                       # shadcn/ui primitives
│   │   └── aquanutri/                # AQUANUTRI screens
│   │       ├── home-screen.tsx
│   │       ├── scan-screen.tsx
│   │       ├── results-screen.tsx
│   │       ├── recommendations-screen.tsx
│   │       ├── aquaculture-screen.tsx
│   │       ├── timeline-screen.tsx
│   │       ├── about-screen.tsx
│   │       ├── side-nav.tsx          # Desktop sidebar
│   │       ├── bottom-nav.tsx        # Mobile tab bar
│   │       ├── top-bar.tsx           # Mobile header
│   │       └── desktop-header.tsx    # Desktop sticky header
│   └── lib/aquanutri/
│       ├── types.ts                  # Shared TypeScript types
│       ├── fish-data.ts              # CSV loader (RFC-4180 parser)
│       ├── recommend.ts              # Weighted recommendation engine
│       ├── storage.ts                # localStorage scan timeline
│       └── ui.ts                     # Severity/water-type UI helpers
├── mini-services/
│   └── skin-api/                     # Flask inference service
│       ├── server.py
│       └── requirements.txt
├── scripts/
│   ├── 01_generate_dataset.py        # Synthetic skin dataset generator
│   ├── 02_train_resnet50.py          # ResNet50 training pipeline
│   └── 03_build_fish_db.py           # Fish nutrient CSV builder
├── ml/
│   ├── data/
│   │   ├── fish_nutrients.csv        # 28 species, per-100g profiles
│   │   └── skin/                     # Training dataset (6 classes)
│   └── models/                       # Trained .h5 (Git LFS) + history JSON
├── Dockerfile                        # HF Spaces deployment
├── docker-entrypoint.sh              # Starts Flask + Next.js together
├── .gitattributes                    # Git LFS tracking for .h5 model
└── package.json
```

---

## 📱 Responsive Design

The app is fully responsive:

- **Mobile (`<1024px`)**: Top bar + 6-tab bottom navigation + single-column content
- **Desktop (`≥1024px`)**: Fixed sidebar nav + sticky page header + multi-column content grids
- **Wide desktop (`≥1280px`)**: 3-column fish card grid, taller charts, status pills in header

---

## ⚠️ Disclaimer

AQUANUTRI is an educational tool demonstrating the intersection of AI diagnostics and sustainable nutrition. It is **not a medical device** and its predictions should not replace clinical evaluation by a qualified healthcare professional. Always consult a clinician for diagnosis and treatment of nutritional deficiencies.

---

## 📄 License

MIT
