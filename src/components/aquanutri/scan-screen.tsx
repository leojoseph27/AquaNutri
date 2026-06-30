"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, X, Loader2, Info, RefreshCw, Image as ImageIcon, AlertCircle } from "lucide-react";
import type { PredictionResponse } from "@/lib/aquanutri/types";

interface Props {
  onPrediction: (pred: PredictionResponse, image: string) => void;
}

type Stage = "idle" | "ready" | "predicting" | "error";

export function ScanScreen({ onPrediction }: Props) {
  const [stage, setStage] = useState<Stage>("idle");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [apiUp, setApiUp] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Probe API health on first mount
  useEffect(() => {
    let cancelled = false;
    fetch("/api/predict", { method: "GET" })
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setApiUp(!!d.up); })
      .catch(() => { if (!cancelled) setApiUp(false); });
    return () => { cancelled = true; };
  }, []);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload an image file (JPG/PNG).");
      setStage("error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageDataUrl(reader.result as string);
      setStage("ready");
      setErrorMsg("");
    };
    reader.readAsDataURL(file);
  }, []);

  const handleUploadClick = () => fileInputRef.current?.click();
  const handleCameraClick = () => cameraInputRef.current?.click();

  const handleReset = () => {
    setImageDataUrl(null);
    setStage("idle");
    setErrorMsg("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handlePredict = async () => {
    if (!imageDataUrl) return;
    setStage("predicting");
    setErrorMsg("");
    try {
      // Convert data URL to File
      const resp = await fetch(imageDataUrl);
      const blob = await resp.blob();
      const file = new File([blob], "skin.jpg", { type: blob.type || "image/jpeg" });

      const form = new FormData();
      form.append("image", file);

      const apiResp = await fetch("/api/predict", { method: "POST", body: form });
      if (!apiResp.ok) {
        const err = await apiResp.json().catch(() => ({}));
        throw new Error(err.error || `Server error ${apiResp.status}`);
      }
      const data: PredictionResponse = await apiResp.json();
      onPrediction(data, imageDataUrl);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : String(e));
      setStage("error");
    }
  };

  return (
    <div className="space-y-4">
      <div className="px-1 lg:hidden">
        <h1 className="text-xl font-bold text-slate-800">Skin Scan</h1>
        <p className="text-sm text-slate-600 mt-1">
          Upload or capture a clear photo of the affected skin area. The ResNet50
          model analyses dermal patterns associated with common nutritional
          deficiencies.
        </p>
      </div>

      {/* Two-column on desktop: scanner on left, info on right */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Left: image preview / dropzone (3 cols on desktop) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Guidance card - shown above scanner on all sizes */}
          <Card className="border-teal-200 bg-teal-50/50">
            <CardContent className="p-3 flex items-start gap-2">
              <Info className="h-4 w-4 text-teal-700 mt-0.5 shrink-0" />
              <p className="text-xs text-slate-700 leading-relaxed">
                <strong>For best results:</strong> use natural lighting, get close enough
                that the skin fills most of the frame, and avoid makeup or filters. This
                tool is informational and not a substitute for clinical diagnosis.
              </p>
            </CardContent>
          </Card>

          {imageDataUrl ? (
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <div className="relative aspect-square bg-slate-900">
                <img
                  src={imageDataUrl}
                  alt="Captured skin"
                  className="w-full h-full object-contain"
                />
                <button
                  onClick={handleReset}
                  className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <CardContent className="p-3 flex gap-2">
                <Button
                  onClick={handlePredict}
                  disabled={stage === "predicting"}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 h-11"
                >
                  {stage === "predicting" ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analysing skin...
                    </>
                  ) : (
                    <>
                      <SparklesIcon /> Detect Deficiency
                    </>
                  )}
                </Button>
                <Button onClick={handleReset} variant="outline" disabled={stage === "predicting"} className="h-11">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-dashed border-slate-300 bg-white shadow-none">
              <CardContent className="p-6 lg:p-10 flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
                  <ImageIcon className="h-7 w-7 text-teal-600" />
                </div>
                <h3 className="font-semibold text-slate-800">Add a skin image</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Take a photo with your camera or upload an existing image to begin
                  the deficiency analysis.
                </p>
                <div className="grid grid-cols-2 gap-3 w-full mt-5 max-w-sm">
                  <Button onClick={handleCameraClick} className="bg-teal-600 hover:bg-teal-700 h-12">
                    <Camera className="h-5 w-5 mr-2" /> Camera
                  </Button>
                  <Button onClick={handleUploadClick} variant="outline" className="h-12">
                    <Upload className="h-5 w-5 mr-2" /> Upload
                  </Button>
                </div>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              </CardContent>
            </Card>
          )}

          {/* Error */}
          {stage === "error" && errorMsg && (
            <Card className="border-rose-200 bg-rose-50">
              <CardContent className="p-4 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-rose-800 text-sm">Prediction failed</p>
                  <p className="text-xs text-rose-700 mt-1">{errorMsg}</p>
                  {apiUp === false && (
                    <p className="text-xs text-rose-700 mt-2">
                      The Python inference service appears to be offline. Please try
                      again in a moment.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: classes + pipeline (2 cols on desktop) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Classes the model knows */}
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">What the model detects</h3>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className="text-rose-700 border-rose-200 bg-rose-50">Iron Deficiency</Badge>
                <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50">Vitamin B12</Badge>
                <Badge variant="outline" className="text-yellow-700 border-yellow-200 bg-yellow-50">Vitamin D</Badge>
                <Badge variant="outline" className="text-orange-700 border-orange-200 bg-orange-50">Zinc</Badge>
                <Badge variant="outline" className="text-teal-700 border-teal-200 bg-teal-50">Vitamin A</Badge>
                <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50">Healthy</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Pipeline */}
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">How it works</h3>
              <ol className="space-y-2.5">
                {[
                  ["1", "Image is resized to 224×224 and ResNet50-preprocessed"],
                  ["2", "ResNet50 forward pass produces a 6-class probability vector"],
                  ["3", "Top class + secondary flags above 30% are reported"],
                  ["4", "Severity is derived from confidence thresholds"],
                  ["5", "Deficiencies are passed to the fish recommendation engine"],
                ].map(([n, t]) => (
                  <li key={n} className="flex items-start gap-2.5">
                    <span className="h-5 w-5 rounded-full bg-teal-100 text-teal-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {n}
                    </span>
                    <span className="text-xs text-slate-600 leading-relaxed">{t}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* API status (desktop only) */}
          <Card className="border-slate-200 shadow-sm hidden lg:block">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-700">Inference service</h3>
                <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${
                  apiUp === true ? "bg-emerald-50 text-emerald-700" : apiUp === false ? "bg-rose-50 text-rose-700" : "bg-slate-50 text-slate-600"
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    apiUp === true ? "bg-emerald-500 animate-pulse" : apiUp === false ? "bg-rose-500" : "bg-slate-400"
                  }`} />
                  {apiUp === true ? "Live" : apiUp === false ? "Offline" : "Checking"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Powered by Flask + TensorFlow. Forwards to <code className="text-[10px] bg-slate-100 px-1 rounded">/api/predict</code> which proxies to the Python service on port 5001.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SparklesIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
      <path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3z" />
    </svg>
  );
}
