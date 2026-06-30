"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Database,
  FlaskConical,
  Heart,
  Globe2,
  Code2,
} from "lucide-react";

export function AboutScreen() {
  return (
    <div className="space-y-4">
      <div className="px-1 lg:hidden">
        <h1 className="text-xl font-bold text-slate-800">About AQUANUTRI</h1>
        <p className="text-sm text-slate-600 mt-1">
          A mobile platform that unites AI skin diagnostics with sustainable
          aquaculture to combat malnutrition.
        </p>
      </div>

      {/* Mission */}
      <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-emerald-50 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0">
              <Heart className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Mission</h2>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                AQUANUTRI bridges AI diagnostics and nutritional ecology. By reading
                dermal signs of vitamin and mineral deficiencies, then recommending
                locally appropriate fish species for terrace aquaculture, the
                platform empowers underserved communities with proactive, sustainable
                health tools.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-teal-600" />
            <h3 className="text-sm font-semibold text-slate-700">Model architecture</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <Spec label="Base network" value="ResNet50" />
            <Spec label="Pre-training" value="ImageNet" />
            <Spec label="Transfer" value="Fine-tuned" />
            <Spec label="Input size" value="224 × 224 × 3" />
            <Spec label="Classes" value="6" />
            <Spec label="Head" value="GAP → Dense 256 → Softmax" />
            <Spec label="Augmentation" value="Flip, Rotate, Zoom, Contrast, Brightness" />
            <Spec label="Optimizer" value="Adam (1e-3 → 1e-5)" />
          </div>
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-600 leading-relaxed">
              Stage A trains the new classifier head with the ResNet50 base frozen.
              Stage B unfreezes the top 20 ResNet layers and fine-tunes them at a
              100× lower learning rate to specialise the network on dermal
              deficiency patterns.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Dataset */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-semibold text-slate-700">Dataset</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            The paper specifies the <strong>DermNet</strong> skin-condition dataset
            as the training source. This live demo uses a programmatically-generated
            skin dataset that mirrors DermNet's per-class folder structure and
            visual deficiency patterns (pallor, jaundice, scaling, erythema,
            hyperkeratosis). The training pipeline is fully functional and can be
            re-run on real DermNet images by replacing the contents of
            <code className="text-[11px] bg-slate-100 px-1 mx-0.5 rounded">ml/data/skin/</code>
            with real images arranged in the same per-class folders.
          </p>
          <div className="grid grid-cols-3 gap-2 pt-1">
            <Stat label="Classes" value="6" />
            <Stat label="Images / class" value="80" />
            <Stat label="Total" value="480" />
          </div>
        </CardContent>
      </Card>

      {/* Tech stack */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Code2 className="h-4 w-4 text-slate-600" />
            <h3 className="text-sm font-semibold text-slate-700">Tech stack</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <TechPill name="Next.js 16" role="Frontend" />
            <TechPill name="TypeScript" role="Language" />
            <TechPill name="Tailwind + shadcn/ui" role="Styling" />
            <TechPill name="TensorFlow 2 / Keras" role="ML training" />
            <TechPill name="ResNet50" role="CNN backbone" />
            <TechPill name="Flask" role="Inference API" />
            <TechPill name="Recharts" role="Visualisations" />
            <TechPill name="localStorage" role="Per-device timeline" />
          </div>
        </CardContent>
      </Card>

      {/* Architecture flow */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <FlaskConical className="h-4 w-4 text-amber-600" />
            <h3 className="text-sm font-semibold text-slate-700">End-to-end pipeline</h3>
          </div>
          <ol className="space-y-2.5">
            {[
              ["Capture", "User uploads or captures a skin image in the mobile UI"],
              ["Preprocess", "Image resized to 224², ResNet50 preprocessing applied"],
              ["Inference", "Flask service runs the fine-tuned ResNet50 forward pass"],
              ["Rank", "Top class + secondary flags (>30%) reported with severity"],
              ["Recommend", "Deficiencies passed to fish DB, filtered by water/region/difficulty"],
              ["Persist", "Scan saved to per-device timeline for progress tracking"],
            ].map(([step, desc], i) => (
              <li key={step} className="flex items-start gap-2.5">
                <span className="h-5 w-5 rounded-full bg-teal-100 text-teal-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <div>
                  <p className="text-xs font-semibold text-slate-800">{step}</p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Globe2 className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900 text-sm">Disclaimer</p>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                AQUANUTRI is an educational tool intended to demonstrate the
                intersection of AI diagnostics and sustainable nutrition. It is
                <strong> not a medical device</strong> and its predictions should
                not replace clinical evaluation by a qualified healthcare
                professional. Always consult a clinician for diagnosis and
                treatment of nutritional deficiencies.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center pt-2 pb-4">
        <Badge variant="outline" className="text-slate-500 border-slate-200">
          AQUANUTRI v1.0 · Built with Z.ai
        </Badge>
      </div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className="text-xs font-medium text-slate-800">{value}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-2 text-center">
      <p className="text-lg font-bold text-slate-800">{value}</p>
      <p className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</p>
    </div>
  );
}

function TechPill({ name, role }: { name: string; role: string }) {
  return (
    <div className="rounded-lg border border-slate-200 p-2">
      <p className="text-xs font-semibold text-slate-800">{name}</p>
      <p className="text-[10px] text-slate-500">{role}</p>
    </div>
  );
}
