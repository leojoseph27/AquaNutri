"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sprout,
  Droplets,
  Fish,
  Thermometer,
  Ruler,
  Utensils,
  Wrench,
  BookOpen,
  Leaf,
  Recycle,
} from "lucide-react";

export function AquacultureScreen() {
  return (
    <div className="space-y-4">
      <div className="px-1 lg:hidden">
        <h1 className="text-xl font-bold text-slate-800">Terrace Aquaculture Guide</h1>
        <p className="text-sm text-slate-600 mt-1">
          Everything you need to start a small-scale fish farm on your rooftop,
          balcony, or backyard - sustainable protein for your household.
        </p>
      </div>

      {/* Hero */}
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Sprout className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Why terrace aquaculture?</h2>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                Urban expansion limits traditional farming, but a 200L rooftop tank
                can produce 10-15kg of fish per year - enough to meaningfully close
                household nutrient gaps while reducing reliance on industrial food
                systems.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step-by-step */}
      <section>
        <h2 className="text-sm font-semibold text-slate-700 mb-3 px-1">Getting started - 6 steps</h2>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
          <Step
            n={1}
            icon={<Ruler className="h-5 w-5" />}
            tint="bg-teal-100 text-teal-700"
            title="Pick the right tank size"
            body="A 200L tank suits 8-10 small fish (tilapia, gourami). 400L+ supports carp, trout, or milkfish. Match tank to your space and target species."
          />
          <Step
            n={2}
            icon={<Droplets className="h-5 w-5" />}
            tint="bg-cyan-100 text-cyan-700"
            title="Choose your water source"
            body="Freshwater is easiest for beginners. Brackish (mix of fresh + salt) suits milkfish and barramundi. Marine requires synthetic salt mix and is advanced."
          />
          <Step
            n={3}
            icon={<Fish className="h-5 w-5" />}
            tint="bg-emerald-100 text-emerald-700"
            title="Stock juvenile fish"
            body="Buy fingerlings from a local hatchery. Stock at 1 fish per 20-30L of water. Acclimate them slowly to your tank temperature over 30 minutes."
          />
          <Step
            n={4}
            icon={<Thermometer className="h-5 w-5" />}
            tint="bg-amber-100 text-amber-700"
            title="Maintain water quality"
            body="Test pH (6.5-8.5), ammonia (&lt;0.5ppm), and temperature (22-30°C for tropical species). 20% water change weekly. Aerate 24/7 with an air pump."
          />
          <Step
            n={5}
            icon={<Utensils className="h-5 w-5" />}
            tint="bg-rose-100 text-rose-700"
            title="Feed on schedule"
            body="Feed 2-3x daily, only what they eat in 5 minutes. Pelleted feed (28-32% protein) works for most species. Herbivores like rabbitfish accept kitchen scraps."
          />
          <Step
            n={6}
            icon={<Recycle className="h-5 w-5" />}
            tint="bg-purple-100 text-purple-700"
            title="Pair with plants (aquaponics)"
            body="Route tank water through a gravel bed growing leafy greens. Plants filter the water; fish waste fertilises them - a closed-loop ecosystem."
          />
        </div>
      </section>

      {/* Recommended beginner species */}
      <section>
        <h2 className="text-sm font-semibold text-slate-700 mb-3 px-1">Beginner-friendly species</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <SpeciesCard
            name="Tilapia"
            water="freshwater"
            tank="200L"
            temp="22-30°C"
            growth="6-8 mo to harvest"
            note="The classic starter fish - tolerant of beginners' mistakes."
          />
          <SpeciesCard
            name="Catfish"
            water="freshwater"
            tank="250L"
            temp="20-28°C"
            growth="6-9 mo to harvest"
            note="Air-breathing - survives low-oxygen water."
          />
          <SpeciesCard
            name="Gourami"
            water="freshwater"
            tank="200L"
            temp="24-30°C"
            growth="5-7 mo to harvest"
            note="Labyrinth fish - needs no aeration."
          />
          <SpeciesCard
            name="Milkfish"
            water="brackish"
            tank="500L"
            temp="25-32°C"
            growth="8-10 mo to harvest"
            note="Staple of Philippine backyard ponds."
          />
          <SpeciesCard
            name="Barramundi"
            water="brackish"
            tank="600L"
            temp="26-32°C"
            growth="8-12 mo to harvest"
            note="Premium taste; euryhaline (fresh or brackish)."
          />
          <SpeciesCard
            name="Rabbitfish"
            water="brackish"
            tank="400L"
            temp="24-30°C"
            growth="6-9 mo to harvest"
            note="Herbivorous - feed kitchen greens. High in vitamin A."
          />
        </div>
      </section>

      {/* SDG alignment */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Leaf className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-semibold text-slate-700">Aligns with UN SDGs</h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50">SDG 2 · Zero Hunger</Badge>
            <Badge variant="outline" className="text-teal-700 border-teal-200 bg-teal-50">SDG 3 · Good Health</Badge>
            <Badge variant="outline" className="text-cyan-700 border-cyan-200 bg-cyan-50">SDG 6 · Clean Water</Badge>
            <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50">SDG 11 · Sustainable Cities</Badge>
            <Badge variant="outline" className="text-rose-700 border-rose-200 bg-rose-50">SDG 12 · Responsible Consumption</Badge>
            <Badge variant="outline" className="text-purple-700 border-purple-200 bg-purple-50">SDG 14 · Life Below Water</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance checklist */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Wrench className="h-4 w-4 text-slate-600" />
            <h3 className="text-sm font-semibold text-slate-700">Weekly maintenance checklist</h3>
          </div>
          <ul className="space-y-2">
            {[
              "Test water pH, ammonia, nitrite, nitrate",
              "20% water change using dechlorinated water",
              "Inspect fish for disease signs (spots, lesions, abnormal swimming)",
              "Clean filter media in tank water (not tap water)",
              "Check air pump and water pump operation",
              "Remove uneaten food and debris",
              "Log fish count, size, and behaviour observations",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span className="h-4 w-4 rounded border border-slate-300 mt-0.5 shrink-0" />
                <span className="text-xs text-slate-700">{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="border-teal-200 bg-teal-50/50">
        <CardContent className="p-4 flex items-start gap-3">
          <BookOpen className="h-5 w-5 text-teal-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-slate-800 text-sm">Further reading</p>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              This guide draws on FAO Fisheries Technical Paper 659 (Miao &amp; Lal,
              2021) and the aquaponics review by Maucieri et al. (2018). For local
              regulations on urban aquaculture, consult your municipal fisheries
              office.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="h-2" />
    </div>
  );
}

function Step({
  n,
  icon,
  tint,
  title,
  body,
}: {
  n: number;
  icon: React.ReactNode;
  tint: string;
  title: string;
  body: string;
}) {
  return (
    <Card className="border-slate-200 shadow-sm h-full">
      <CardContent className="p-4 flex items-start gap-3 h-full">
        <div className={`h-10 w-10 rounded-xl ${tint} flex items-center justify-center shrink-0 relative`}>
          {icon}
          <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-slate-800 text-white text-[10px] font-bold flex items-center justify-center">
            {n}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed" dangerouslySetInnerHTML={{ __html: body }} />
        </div>
      </CardContent>
    </Card>
  );
}

function SpeciesCard({
  name,
  water,
  tank,
  temp,
  growth,
  note,
}: {
  name: string;
  water: string;
  tank: string;
  temp: string;
  growth: string;
  note: string;
}) {
  return (
    <Card className="border-slate-200 shadow-sm h-full">
      <CardContent className="p-3 h-full">
        <div className="flex items-center justify-between mb-1.5">
          <h4 className="font-semibold text-slate-800 text-sm">{name}</h4>
          <Badge variant="outline" className="text-[10px] capitalize">{water}</Badge>
        </div>
        <div className="space-y-1 text-[11px] text-slate-600">
          <div className="flex justify-between">
            <span>Tank size</span>
            <span className="font-medium">{tank}</span>
          </div>
          <div className="flex justify-between">
            <span>Temperature</span>
            <span className="font-medium">{temp}</span>
          </div>
          <div className="flex justify-between">
            <span>Harvest</span>
            <span className="font-medium">{growth}</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 italic mt-2 leading-relaxed">{note}</p>
      </CardContent>
    </Card>
  );
}
