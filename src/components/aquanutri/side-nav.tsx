"use client";

import { Home, Camera, Fish, Sprout, LineChart, Info } from "lucide-react";
import type { TabKey } from "@/app/page";

interface Props {
  active: TabKey;
  onChange: (t: TabKey) => void;
}

const ITEMS: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
  { key: "home",            label: "Home",           icon: Home,      desc: "Dashboard & overview" },
  { key: "scan",            label: "Scan Skin",      icon: Camera,    desc: "AI deficiency detection" },
  { key: "recommendations", label: "Fish Picks",     icon: Fish,      desc: "Personalized species" },
  { key: "aquaculture",     label: "Terrace Farm",   icon: Sprout,    desc: "Aquaculture guide" },
  { key: "timeline",        label: "Timeline",       icon: LineChart, desc: "Your scan history" },
  { key: "about",           label: "About",          icon: Info,      desc: "Model & references" },
];

export function SideNav({ active, onChange }: Props) {
  return (
    <aside
      className="hidden lg:flex flex-col w-72 shrink-0 border-r border-slate-200 bg-white h-screen sticky top-0"
      aria-label="Primary navigation"
    >
      {/* Brand */}
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-700 flex items-center justify-center shadow-sm">
            <img src="/aquanutri-icon.svg" alt="AQUANUTRI" className="h-8 w-8" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-bold tracking-wide text-slate-900 text-base">AQUANUTRI</span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-teal-700">
              Skin AI · Aquaculture
            </span>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {ITEMS.map(({ key, label, icon: Icon, desc }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group ${
                isActive
                  ? "bg-teal-50 text-teal-800 ring-1 ring-teal-100"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                isActive ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
              }`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${isActive ? "text-teal-800" : "text-slate-700"}`}>{label}</p>
                <p className="text-[11px] text-slate-400 truncate">{desc}</p>
              </div>
              {isActive && <div className="h-1.5 w-1.5 rounded-full bg-teal-600" />}
            </button>
          );
        })}
      </nav>

      {/* Footer status */}
      <div className="px-4 py-3 border-t border-slate-100">
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-semibold text-slate-700">All systems live</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            ResNet50 model · Flask API · 28 fish species
          </p>
        </div>
      </div>
    </aside>
  );
}
