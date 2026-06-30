# AQUANUTRI 🐟🩺

**AI Skin Deficiency Detection & Sustainable Fish Nutrition Platform**

AQUANUTRI is a full-stack mobile-first web platform that detects nutritional deficiencies from skin images using a fine-tuned ResNet50 CNN, and recommends nutrient-rich, locally-suitable fish species for sustainable terrace aquaculture.

Built from the TELEMATIQUE 2025 research paper *"Aquanutri: A Mobile Platform for Skin-Based Deficiency Detection and Nutrient-Rich Fish Recommendation"*.

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
| **Final val accuracy** | 96.88% |
| **Inference** | Flask service on port 5001, ~120ms per image |

### Re-train the model

The trained model (`ml/models/aquanutri_resnet50.h5`, ~165 MB) is **excluded from the repo** because GitHub rejects files >100 MB. To regenerate it:

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

- Node.js 18+ and [Bun](https://bun.sh)
- Python 3.10+ with `tensorflow`, `flask`, `flask-cors`, `Pillow`, `numpy`, `pandas`

### Install & run

```bash
# 1. Install frontend deps
bun install

# 2. Train the model (first time only — see ML Pipeline above)
python3 scripts/01_generate_dataset.py
python3 scripts/02_train_resnet50.py

# 3. Start the Flask inference service (background)
cd mini-services/skin-api && python3 server.py &

# 4. Start the Next.js dev server
bun run dev
```

Open http://localhost:3000 in your browser.

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
│   └── skin-api/server.py            # Flask inference service (port 5001)
├── scripts/
│   ├── 01_generate_dataset.py        # Synthetic skin dataset generator
│   ├── 02_train_resnet50.py          # ResNet50 training pipeline
│   └── 03_build_fish_db.py           # Fish nutrient CSV builder
├── ml/
│   ├── data/
│   │   ├── fish_nutrients.csv        # 28 species, per-100g profiles
│   │   └── skin/                     # Training dataset (gitignored)
│   └── models/                       # Trained model + history (gitignored)
└── prisma/                           # Prisma ORM schema (optional)
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
