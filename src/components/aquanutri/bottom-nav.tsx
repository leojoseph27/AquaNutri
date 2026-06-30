"use client";

import { Home, Camera, Fish, Sprout, LineChart, Info } from "lucide-react";
import type { TabKey } from "@/app/page";

interface Props {
  active: TabKey;
  onChange: (t: TabKey) => void;
}

const ITEMS: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "home",           label: "Home",     icon: Home },
  { key: "scan",           label: "Scan",     icon: Camera },
  { key: "recommendations",label: "Fish",     icon: Fish },
  { key: "aquaculture",    label: "Farm",     icon: Sprout },
  { key: "timeline",       label: "Timeline", icon: LineChart },
  { key: "about",          label: "About",    icon: Info },
];

export function BottomNav({ active, onChange }: Props) {
  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-200 shadow-[0_-2px_12px_rgba(15,23,42,0.04)]"
      aria-label="Primary navigation"
    >
      <div className="max-w-md mx-auto grid grid-cols-6">
        {ITEMS.map(({ key, label, icon: Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`flex flex-col items-center justify-center gap-1 py-2.5 transition-colors ${
                isActive ? "text-teal-700" : "text-slate-500 hover:text-slate-700"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className={`h-5 w-5 ${isActive ? "scale-110" : ""} transition-transform`} />
              <span className="text-[10px] font-medium tracking-wide">{label}</span>
              <span
                className={`h-0.5 w-6 rounded-full transition-colors ${
                  isActive ? "bg-teal-600" : "bg-transparent"
                }`}
              />
            </button>
          );
        })}
      </div>
      {/* iOS safe area spacer */}
      <div className="h-[env(safe-area-inset-bottom,0px)]" />
    </nav>
  );
}
