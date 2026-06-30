"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Fish,
  Filter,
  Loader2,
  Droplets,
  Gauge,
  MapPin,
  Sprout,
  RefreshCw,
  Info,
} from "lucide-react";
import type { DeficiencyClass, RankedFish, RecommendationFilters, WaterType } from "@/lib/aquanutri/types";
import { WATER_TYPE_META, DIFFICULTY_META } from "@/lib/aquanutri/ui";

interface Props {
  detectedDeficiencies: DeficiencyClass[];
}

const ALL_DEFICIENCIES: { key: DeficiencyClass; label: string }[] = [
  { key: "iron_deficiency",        label: "Iron" },
  { key: "vitamin_b12_deficiency", label: "Vitamin B12" },
  { key: "vitamin_d_deficiency",   label: "Vitamin D" },
  { key: "zinc_deficiency",        label: "Zinc" },
  { key: "vitamin_a_deficiency",   label: "Vitamin A" },
];

export function RecommendationsScreen({ detectedDeficiencies }: Props) {
  const [selectedDefs, setSelectedDefs] = useState<DeficiencyClass[]>(detectedDeficiencies);
  const [waterTypes, setWaterTypes] = useState<WaterType[]>(["freshwater", "brackish", "marine"]);
  const [region, setRegion] = useState<string>("all");
  const [farmingOnly, setFarmingOnly] = useState(false);
  const [maxDifficulty, setMaxDifficulty] = useState<"easy" | "medium" | "hard" | "all">("all");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RankedFish[]>([]);
  const [error, setError] = useState<string>("");

  // Sync from props when a new scan comes in
  useEffect(() => {
    setSelectedDefs(detectedDeficiencies);
  }, [detectedDeficiencies]);

  const runRecommendation = async () => {
    setLoading(true);
    setError("");
    try {
      const filters: RecommendationFilters = {
        deficiencies: selectedDefs,
        waterTypes,
        region: region === "all" ? undefined : region,
        farmingOnly,
        maxDifficulty: maxDifficulty === "all" ? undefined : maxDifficulty,
      };
      const resp = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters),
      });
      if (!resp.ok) throw new Error(`Server error ${resp.status}`);
      const data = await resp.json();
      setResults(data.recommendations || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    runRecommendation();
  }, []);

  const toggleDef = (d: DeficiencyClass) => {
    setSelectedDefs((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);
  };

  const toggleWater = (w: WaterType) => {
    setWaterTypes((prev) => prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w]);
  };

  return (
    <div className="space-y-4">
      <div className="px-1 lg:hidden">
        <h1 className="text-xl font-bold text-slate-800">Fish Recommendations</h1>
        <p className="text-sm text-slate-600 mt-1">
          Personalized fish species to address your detected nutrient gaps, filtered
          by water type, region, and farming capacity.
        </p>
      </div>

      {/* Detected deficiencies summary - full width */}
      <Card className="border-teal-200 bg-teal-50/50 shadow-sm">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Target deficiencies
            </p>
            {detectedDeficiencies.length > 0 && (
              <Badge className="bg-teal-600 text-white border-0">
                From last scan
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ALL_DEFICIENCIES.map((d) => {
              const active = selectedDefs.includes(d.key);
              const fromScan = detectedDeficiencies.includes(d.key);
              return (
                <button
                  key={d.key}
                  onClick={() => toggleDef(d.key)}
                  className={`text-xs px-2.5 py-1 rounded-full transition-colors border ${
                    active
                      ? "bg-teal-600 text-white border-teal-600"
                      : "bg-white text-slate-600 border-slate-200 hover:border-teal-300"
                  }`}
                >
                  {fromScan && <span className="mr-1">●</span>}
                  {d.label}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Desktop: sidebar filters + grid results. Mobile: stacked. */}
      <div className="grid lg:grid-cols-12 gap-4">
        {/* Filter sidebar */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="lg:sticky lg:top-24">
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-2 text-slate-700">
                  <Filter className="h-4 w-4 text-teal-600" />
                  <h3 className="text-sm font-semibold">Filters</h3>
                </div>

                {/* Water type */}
                <div>
                  <Label className="text-xs text-slate-600 mb-2 block">Water type</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["freshwater", "brackish", "marine"] as WaterType[]).map((w) => {
                      const meta = WATER_TYPE_META[w];
                      const active = waterTypes.includes(w);
                      return (
                        <button
                          key={w}
                          onClick={() => toggleWater(w)}
                          className={`text-xs px-2 py-2 rounded-xl border transition-all ${
                            active
                              ? `${meta.bg} ${meta.color} border-current ring-1 ring-current/20`
                              : "bg-white text-slate-500 border-slate-200"
                          }`}
                        >
                          <div className="text-base leading-none mb-1">{meta.icon}</div>
                          {meta.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Region */}
                <div>
                  <Label className="text-xs text-slate-600 mb-2 block">Region</Label>
                  <Select value={region} onValueChange={setRegion}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Any region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any region</SelectItem>
                      <SelectItem value="Asia">Asia</SelectItem>
                      <SelectItem value="Africa">Africa</SelectItem>
                      <SelectItem value="South America">South America</SelectItem>
                      <SelectItem value="Europe">Europe</SelectItem>
                      <SelectItem value="North America">North America</SelectItem>
                      <SelectItem value="Pacific">Pacific</SelectItem>
                      <SelectItem value="Mediterranean">Mediterranean</SelectItem>
                      <SelectItem value="Indian Ocean">Indian Ocean</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Difficulty */}
                <div>
                  <Label className="text-xs text-slate-600 mb-2 block">Max farming difficulty</Label>
                  <Select value={maxDifficulty} onValueChange={(v) => setMaxDifficulty(v as any)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Any difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any difficulty</SelectItem>
                      <SelectItem value="easy">Beginner-friendly only</SelectItem>
                      <SelectItem value="medium">Up to intermediate</SelectItem>
                      <SelectItem value="hard">Allow advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Farming only toggle */}
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <div>
                    <p className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                      <Sprout className="h-4 w-4 text-emerald-600" />
                      Terrace-farmable only
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Show only species suitable for home aquaponics.
                    </p>
                  </div>
                  <Switch checked={farmingOnly} onCheckedChange={setFarmingOnly} />
                </div>

                <Button
                  onClick={runRecommendation}
                  disabled={loading}
                  className="w-full bg-teal-600 hover:bg-teal-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Finding matches...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" /> Update recommendations
                    </>
                  )}
                </Button>
                {error && <p className="text-xs text-rose-600">{error}</p>}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Results grid */}
        <div className="lg:col-span-8 xl:col-span-9">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-sm font-semibold text-slate-700">
              {results.length} matching species
            </h3>
            {results.length > 0 && (
              <span className="text-[11px] text-slate-500">sorted by match score</span>
            )}
          </div>

          {results.length === 0 && !loading ? (
            <Card className="border-slate-200">
              <CardContent className="p-6 text-center text-sm text-slate-500">
                No species match the current filters. Try widening your selection.
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-3">
              {results.slice(0, 18).map((f, idx) => (
                <FishCard key={f.species} fish={f} rank={idx + 1} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-start gap-2 pt-1 pb-4 text-[11px] text-slate-500">
        <Info className="h-3 w-3 mt-0.5 shrink-0" />
        <p>
          Match score blends deficiency addressing, per-100g nutrient density,
          farming suitability, and difficulty. Always consult local fishing
          regulations before harvesting.
        </p>
      </div>
    </div>
  );
}

function FishCard({ fish, rank }: { fish: RankedFish; rank: number }) {
  const waterMeta = WATER_TYPE_META[fish.water_type];
  const diffMeta = DIFFICULTY_META[fish.difficulty];
  const matchPct = Math.round(fish.matchScore * 100);
  const nutrients = fish.key_nutrients.split(",").map((s) => s.trim());

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center shrink-0 text-xl relative">
            {waterMeta.icon}
            {rank <= 3 && (
              <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-amber-400 text-amber-900 text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                {rank}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  {rank > 3 && <span className="text-[10px] font-mono text-slate-400">#{rank}</span>}
                  <h4 className="font-semibold text-slate-800 leading-tight">{fish.species}</h4>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${waterMeta.bg} ${waterMeta.color}`}>
                    {waterMeta.label}
                  </span>
                  {fish.farming_suitable === 1 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 inline-flex items-center gap-0.5">
                      <Sprout className="h-2.5 w-2.5" /> Farmable
                    </span>
                  )}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${diffMeta.bg} ${diffMeta.color}`}>
                    {fish.difficulty}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-bold text-teal-700 leading-none">{matchPct}%</p>
                <p className="text-[9px] text-slate-500 uppercase tracking-wider">match</p>
              </div>
            </div>

            {/* Matched deficiencies */}
            {fish.matchedDeficiencies.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {fish.matchedDeficiencies.map((d) => (
                  <Badge key={d} variant="outline" className="text-[10px] text-teal-700 border-teal-200 bg-teal-50">
                    addresses {d.replace("_deficiency", "").replace(/_/g, " ")}
                  </Badge>
                ))}
              </div>
            )}

            {/* Nutrients */}
            <div className="mt-2 flex flex-wrap gap-1">
              {nutrients.map((n) => (
                <span key={n} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                  {n}
                </span>
              ))}
            </div>

            {/* Nutrient grid */}
            <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-100">
              <NutrientPill label="Protein" value={`${fish.protein_g}g`} />
              <NutrientPill label="Omega-3" value={`${fish.omega3_mg}mg`} />
              <NutrientPill label="Iron" value={`${fish.iron_mg}mg`} />
              <NutrientPill label="B12" value={`${fish.vitamin_b12_ug}µg`} />
              <NutrientPill label="Vit D" value={`${fish.vitamin_d_ug}µg`} />
              <NutrientPill label="Zinc" value={`${fish.zinc_mg}mg`} />
              <NutrientPill label="Iodine" value={`${fish.iodine_ug}µg`} />
              <NutrientPill label="Vit A" value={`${fish.vitamin_a_ug}µg`} />
            </div>

            {/* Region & tank */}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {fish.region}
              </span>
              {fish.farming_suitable === 1 && (
                <span className="inline-flex items-center gap-1">
                  <Droplets className="h-3 w-3" /> ~{fish.tank_size_liters}L tank
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Gauge className="h-3 w-3" /> per 100g
              </span>
            </div>

            {fish.notes && (
              <p className="text-[11px] text-slate-600 mt-2 italic leading-relaxed">
                {fish.notes}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NutrientPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-[9px] text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-xs font-semibold text-slate-700">{value}</p>
    </div>
  );
}
