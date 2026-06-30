"use client";

import { useState, useCallback } from "react";
import { HomeScreen } from "@/components/aquanutri/home-screen";
import { ScanScreen } from "@/components/aquanutri/scan-screen";
import { ResultsScreen } from "@/components/aquanutri/results-screen";
import { RecommendationsScreen } from "@/components/aquanutri/recommendations-screen";
import { AquacultureScreen } from "@/components/aquanutri/aquaculture-screen";
import { TimelineScreen } from "@/components/aquanutri/timeline-screen";
import { AboutScreen } from "@/components/aquanutri/about-screen";
import { BottomNav } from "@/components/aquanutri/bottom-nav";
import { TopBar } from "@/components/aquanutri/top-bar";
import { SideNav } from "@/components/aquanutri/side-nav";
import { DesktopHeader } from "@/components/aquanutri/desktop-header";
import { saveScan, newScanId } from "@/lib/aquanutri/storage";
import type { PredictionResponse, DeficiencyClass } from "@/lib/aquanutri/types";

export type TabKey =
  | "home"
  | "scan"
  | "recommendations"
  | "aquaculture"
  | "timeline"
  | "about";

export default function Home() {
  const [tab, setTab] = useState<TabKey>("home");
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [detectedDeficiencies, setDetectedDeficiencies] = useState<DeficiencyClass[]>([]);
  const [scanSaved, setScanSaved] = useState(false);

  // Allow results screen to be shown as a virtual tab when a prediction exists.
  const [showResults, setShowResults] = useState(false);

  const handlePrediction = useCallback(
    (pred: PredictionResponse, image: string) => {
      setPrediction(pred);
      setScannedImage(image);
      setShowResults(true);
      // Persist scan to localStorage timeline (single-fire side effect on event).
      saveScan({
        id: newScanId(),
        timestamp: Date.now(),
        imageUrl: image,
        topClass: pred.top.class as DeficiencyClass,
        topLabel: pred.top.label,
        confidence: pred.top.confidence,
        severity: pred.severity as any,
        secondary: pred.secondary,
      });
      setScanSaved(true);
      // Collect all deficiencies flagged by the model (top + secondary > 0.30)
      const all: DeficiencyClass[] = [pred.top.class as DeficiencyClass];
      for (const s of pred.secondary) {
        if (!all.includes(s.class)) all.push(s.class);
      }
      // Filter out "healthy" since it's not a deficiency
      setDetectedDeficiencies(all.filter((d) => d !== "healthy"));
    },
    [],
  );

  const handleSwitchTab = useCallback((t: TabKey) => {
    setShowResults(false);
    setTab(t);
    // scroll to top on tab change
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  // Show results screen when a fresh prediction is available.
  const activeView = showResults && prediction ? (
    <ResultsScreen
      prediction={prediction}
      imageUrl={scannedImage}
      saved={scanSaved}
      onGetRecommendations={() => {
        setShowResults(false);
        setTab("recommendations");
      }}
      onBack={() => {
        setShowResults(false);
        setTab("scan");
      }}
    />
  ) : (
    <>
      {tab === "home" && <HomeScreen onStartScan={() => handleSwitchTab("scan")} />}
      {tab === "scan" && <ScanScreen onPrediction={handlePrediction} />}
      {tab === "recommendations" && (
        <RecommendationsScreen detectedDeficiencies={detectedDeficiencies} />
      )}
      {tab === "aquaculture" && <AquacultureScreen />}
      {tab === "timeline" && <TimelineScreen />}
      {tab === "about" && <AboutScreen />}
    </>
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Desktop sidebar (lg and up) */}
      <SideNav active={tab} onChange={handleSwitchTab} />

      {/* Mobile top bar (below lg) */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        {/* Desktop header strip showing current page title */}
        <DesktopHeader active={tab} onNavigate={handleSwitchTab} />

        <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 pb-28 lg:pb-10 max-w-7xl">
          {activeView}
        </main>
      </div>

      {/* Mobile bottom nav (below lg) */}
      <BottomNav active={tab} onChange={handleSwitchTab} />
    </div>
  );
}
