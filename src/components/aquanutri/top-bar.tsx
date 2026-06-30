"use client";

export function TopBar() {
  return (
    <header className="lg:hidden sticky top-0 z-30 w-full bg-gradient-to-r from-teal-700 to-emerald-700 text-white shadow-md">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-white/15 ring-1 ring-white/25 flex items-center justify-center backdrop-blur">
          <img src="/aquanutri-icon.svg" alt="AQUANUTRI" className="h-7 w-7" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-bold tracking-wide text-base">AQUANUTRI</span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-teal-100/90">
            Skin AI · Sustainable Aquaculture
          </span>
        </div>
        <div className="ml-auto flex items-center gap-1 text-[10px] uppercase tracking-wider text-teal-50/90">
          <span className="hidden xs:inline">v1.0 · ResNet50</span>
        </div>
      </div>
    </header>
  );
}
