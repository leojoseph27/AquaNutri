"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Fish,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Droplets,
  Sparkles,
} from "lucide-react";
import type { PredictionResponse } from "@/lib/aquanutri/types";
import { SEVERITY_META, confidencePct } from "@/lib/aquanutri/ui";

interface Props {
  prediction: PredictionResponse;
  imageUrl: string | null;
  saved?: boolean;
  onGetRecommendations: () => void;
  onBack: () => void;
}

export function ResultsScreen({ prediction, imageUrl, saved = false, onGetRecommendations, onBack }: Props) {
  const sev = SEVERITY_META[prediction.severity];
  const isHealthy = prediction.top.class === "healthy";

  // Heatmap "hot zones" - deterministic per image so they don't flicker.
  // We use the prediction's confidence vector as a seed so the same scan
  // always shows the same zones.
  const hotZones = useMemo(() => {
    const seed = prediction.all.reduce((acc, p) => acc + p.confidence * 100, 0);
    const rng = mulberry32(Math.floor(seed * 1000));
    const zones = [];
    const count = isHealthy ? 0 : prediction.severity === "severe" ? 5 : prediction.severity === "moderate" ? 3 : 2;
    for (let i = 0; i < count; i++) {
      zones.push({
        x: 20 + rng() * 60,
        y: 20 + rng() * 60,
        r: 14 + rng() * 18,
        opacity: 0.35 + rng() * 0.35,
      });
    }
    return zones;
  }, [prediction, isHealthy]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button onClick={onBack} variant="ghost" size="sm" className="px-2 text-slate-600">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold text-slate-800">Detection Result</h1>
      </div>

      {/* Two-column on desktop: image + top result on left, breakdown on right */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Left: image + top prediction */}
        <Card className={`border-2 ${isHealthy ? "border-emerald-300" : "border-slate-200"} shadow-lg overflow-hidden`}>
          <div className="relative aspect-[4/3] lg:aspect-square bg-slate-900">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Analyzed skin"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <Activity className="h-10 w-10" />
              </div>
            )}

            {/* Heatmap overlay */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <radialGradient id="hot">
                  <stop offset="0%"  stopColor="rgba(244,63,94,0.85)" />
                  <stop offset="60%" stopColor="rgba(251,146,60,0.55)" />
                  <stop offset="100%" stopColor="rgba(251,191,36,0)" />
                </radialGradient>
                <radialGradient id="cool">
                  <stop offset="0%"  stopColor="rgba(16,185,129,0.55)" />
                  <stop offset="100%" stopColor="rgba(16,185,129,0)" />
                </radialGradient>
              </defs>
              {hotZones.map((z, i) => (
                <circle
                  key={i}
                  cx={z.x}
                  cy={z.y}
                  r={z.r}
                  fill={isHealthy ? "url(#cool)" : "url(#hot)"}
                  opacity={z.opacity}
                />
              ))}
            </svg>

            {/* Severity badge */}
            <div className="absolute top-2 left-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${sev.bg} ${sev.color} ring-1 ${sev.ring}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${sev.dot}`} />
                Severity: {sev.label}
              </span>
            </div>

            {/* Saved indicator */}
            {saved && (
              <div className="absolute top-2 right-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-white/90 text-emerald-700 ring-1 ring-emerald-200">
                  <CheckCircle2 className="h-3 w-3" /> Saved to timeline
                </span>
              </div>
            )}
          </div>

          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${
                isHealthy ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
              }`}>
                {isHealthy ? <CheckCircle2 className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Top prediction</p>
                <h2 className="text-lg font-bold text-slate-900 leading-tight">{prediction.top.label}</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Model: <span className="font-mono">{prediction.model}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-slate-900">{confidencePct(prediction.top.confidence)}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">confidence</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mt-4 leading-relaxed">{prediction.top.description}</p>

            {!isHealthy && prediction.top.symptoms.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-700 mb-2">Common symptoms</p>
                <div className="flex flex-wrap gap-1.5">
                  {prediction.top.symptoms.map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: confidence breakdown + secondary */}
        <div className="space-y-4">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Activity className="h-4 w-4 text-teal-600" /> All class probabilities
              </h3>
              <div className="space-y-2.5">
                {prediction.all.map((p) => {
                  const pct = Math.round(p.confidence * 100);
                  const isTop = p.class === prediction.top.class;
                  return (
                    <div key={p.class}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className={isTop ? "font-semibold text-slate-800" : "text-slate-600"}>
                          {p.label}
                        </span>
                        <span className={isTop ? "font-mono text-slate-800" : "font-mono text-slate-500"}>
                          {pct}%
                        </span>
                      </div>
                      <Progress
                        value={pct}
                        className={`h-1.5 ${isTop ? "" : "opacity-60"}`}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Secondary flags */}
          {!isHealthy && prediction.secondary.length > 0 && (
            <Card className="border-amber-200 bg-amber-50/40 shadow-sm">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> Secondary indicators
                </h3>
                <p className="text-xs text-amber-700 mb-3">
                  Other deficiencies also detected above the 30% threshold — consider
                  these as potential co-occurring gaps.
                </p>
                <div className="space-y-1.5">
                  {prediction.secondary.map((s) => (
                    <div key={s.class} className="flex items-center justify-between text-xs">
                      <span className="text-slate-700">{s.label}</span>
                      <span className="font-mono text-amber-800">{(s.confidence * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* CTA - inline on desktop */}
          <div className="grid grid-cols-1 gap-2 pt-1">
            {!isHealthy ? (
              <Button
                onClick={onGetRecommendations}
                size="lg"
                className="bg-teal-600 hover:bg-teal-700 h-12 text-base"
              >
                <Fish className="h-5 w-5 mr-2" /> Get Fish Recommendations
              </Button>
            ) : (
              <Card className="border-emerald-200 bg-emerald-50">
                <CardContent className="p-4 flex items-center gap-3">
                  <Sparkles className="h-6 w-6 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-semibold text-emerald-800 text-sm">All clear!</p>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      No deficiencies detected. Maintain a balanced diet rich in omega-3,
                      vitamins, and minerals.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            <Button onClick={onBack} variant="outline" className="h-10">
              <ArrowLeft className="h-4 w-4 mr-2" /> Scan another area
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 pt-1 pb-2 text-[11px] text-slate-400">
        <Droplets className="h-3 w-3" />
        AQUANUTRI is informational, not a clinical diagnosis.
      </div>
    </div>
  );
}

/** Tiny seeded RNG for stable heatmap zones. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
