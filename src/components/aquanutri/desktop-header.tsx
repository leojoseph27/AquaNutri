"use client";

import { Button } from "@/components/ui/button";
import { Camera, Activity } from "lucide-react";
import type { TabKey } from "@/app/page";

interface Props {
  active: TabKey;
  onNavigate?: (t: TabKey) => void;
}

const TITLES: Record<TabKey, { title: string; subtitle: string }> = {
  home:            { title: "Dashboard",            subtitle: "Welcome to AQUANUTRI" },
  scan:            { title: "Skin Scan",             subtitle: "AI-powered deficiency detection" },
  recommendations: { title: "Fish Recommendations",  subtitle: "Personalized species for your nutrient gaps" },
  aquaculture:     { title: "Terrace Aquaculture",   subtitle: "Sustainable fish farming guide" },
  timeline:        { title: "Health Timeline",       subtitle: "Your scan history & training curves" },
  about:           { title: "About AQUANUTRI",       subtitle: "Model, dataset & references" },
};

export function DesktopHeader({ active, onNavigate }: Props) {
  const { title, subtitle } = TITLES[active];
  return (
    <header className="hidden lg:flex sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="flex-1 max-w-7xl mx-auto px-8 py-3 flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-slate-900 leading-tight">{title}</h1>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 ring-1 ring-emerald-100">
            <Activity className="h-3 w-3 text-emerald-600" />
            <span className="text-[11px] font-medium text-emerald-700">96.88% val acc</span>
          </div>
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 ring-1 ring-teal-100">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-pulse" />
            <span className="text-[11px] font-medium text-teal-700">API live</span>
          </div>
          <Button
            size="sm"
            className="bg-teal-600 hover:bg-teal-700"
            onClick={() => onNavigate?.("scan")}
          >
            <Camera className="h-4 w-4 mr-1.5" /> Quick Scan
          </Button>
        </div>
      </div>
    </header>
  );
}
