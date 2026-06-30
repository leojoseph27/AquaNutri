"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  Fish,
  Sprout,
  ShieldCheck,
  Activity,
  Droplets,
  Sparkles,
  ArrowRight,
  Heart,
  Globe2,
  Brain,
  Database,
  FlaskConical,
} from "lucide-react";
import { getScans } from "@/lib/aquanutri/storage";
import type { ScanRecord } from "@/lib/aquanutri/types";

interface Props {
  onStartScan: () => void;
}

export function HomeScreen({ onStartScan }: Props) {
  const [scans] = useState<ScanRecord[]>(() => getScans());

  const lastScan = scans[0];

  return (
    <div className="space-y-6">
      {/* Hero - two-column on desktop */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 text-white shadow-xl">
        <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute -bottom-12 -left-8 h-48 w-48 rounded-full bg-teal-300/20 blur-3xl" />
        <div className="relative grid lg:grid-cols-2 gap-6 p-6 lg:p-10">
          <div className="flex flex-col justify-center">
            <Badge className="bg-white/15 text-white border-0 backdrop-blur mb-3 w-fit">
              <Sparkles className="h-3 w-3 mr-1" /> AI-Powered mHealth Platform
            </Badge>
            <h1 className="text-2xl lg:text-4xl font-bold leading-tight mb-3">
              Detect nutrient gaps from your skin.<br />
              <span className="text-teal-100">Grow the fish that fix them.</span>
            </h1>
            <p className="text-teal-50/90 text-sm lg:text-base leading-relaxed mb-5 max-w-xl">
              AQUANUTRI uses a fine-tuned <strong>ResNet50</strong> CNN to read dermal
              signs of vitamin &amp; mineral deficiencies, then recommends the right
              fish species for your climate, water, and terrace-farm setup.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={onStartScan}
                size="lg"
                className="bg-white text-teal-700 hover:bg-teal-50 font-semibold shadow-md"
              >
                <Camera className="h-5 w-5 mr-2" /> Scan My Skin Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 text-white border-white/30 hover:bg-white/20 hover:text-white"
              >
                Learn More <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Desktop-only visual */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
              <HeroStat icon={<Brain className="h-5 w-5" />} label="Model" value="ResNet50" sub="96.88% val acc" />
              <HeroStat icon={<Database className="h-5 w-5" />} label="Fish DB" value="28 sp." sub="3 water types" />
              <HeroStat icon={<Activity className="h-5 w-5" />} label="Scans" value={String(scans.length)} sub="this device" />
              <HeroStat icon={<FlaskConical className="h-5 w-5" />} label="Pipeline" value="6 steps" sub="end-to-end" />
            </div>
          </div>
        </div>
      </section>

      {/* Status row - mobile only (desktop shows it inside hero) */}
      <section className="grid grid-cols-3 gap-3 lg:hidden">
        <StatCard
          icon={<ShieldCheck className="h-4 w-4" />}
          label="Model"
          value="ResNet50"
          sub="96.88% val acc"
          tint="text-teal-700 bg-teal-50"
        />
        <StatCard
          icon={<Fish className="h-4 w-4" />}
          label="Fish DB"
          value="28 sp."
          sub="3 water types"
          tint="text-emerald-700 bg-emerald-50"
        />
        <StatCard
          icon={<Activity className="h-4 w-4" />}
          label="Scans"
          value={String(scans.length)}
          sub="this device"
          tint="text-amber-700 bg-amber-50"
        />
      </section>

      {/* Last scan summary + CTA in a 2-col grid on desktop */}
      <section className="grid lg:grid-cols-3 gap-4">
        {lastScan ? (
          <Card className="border-slate-200 shadow-sm lg:col-span-2">
            <CardContent className="p-4 lg:p-5">
              <div className="flex items-center gap-3">
                {lastScan.imageUrl ? (
                  <img
                    src={lastScan.imageUrl}
                    alt="Last scan"
                    className="h-14 w-14 lg:h-16 lg:w-16 rounded-xl object-cover ring-1 ring-slate-200"
                  />
                ) : (
                  <div className="h-14 w-14 lg:h-16 lg:w-16 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                    <Camera className="h-5 w-5" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500">Most recent scan</p>
                  <p className="font-semibold text-slate-800 truncate">{lastScan.topLabel}</p>
                  <p className="text-xs text-slate-500">
                    {(lastScan.confidence * 100).toFixed(1)}% confidence ·{" "}
                    {new Date(lastScan.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="secondary" className="capitalize">
                  {lastScan.severity}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed border-slate-300 shadow-sm lg:col-span-2">
            <CardContent className="p-5 flex items-center gap-3">
              <div className="h-14 w-14 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                <Camera className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800">No scans yet</p>
                <p className="text-xs text-slate-500">Take your first skin scan to start tracking your nutritional health.</p>
              </div>
              <Button onClick={onStartScan} size="sm" className="bg-teal-600 hover:bg-teal-700">
                Start
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="border-teal-200 bg-teal-50/60">
          <CardContent className="p-4 lg:p-5 flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
              <Globe2 className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800 text-sm">Built for underserved communities</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                From rural clinics to urban rooftops, AQUANUTRI brings AI diagnostics
                to anyone with a smartphone.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Feature cards - grid on desktop */}
      <section>
        <h2 className="text-sm font-semibold text-slate-700 mb-3 px-1">What AQUANUTRI does</h2>
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <FeatureRow
            icon={<Camera className="h-5 w-5" />}
            tint="bg-teal-100 text-teal-700"
            title="AI Skin Image Analysis"
            body="ResNet50 fine-tuned on DermNet-style skin data detects pallor, hyperpigmentation, rashes, hyperkeratosis and more — with confidence scores and severity levels."
          />
          <FeatureRow
            icon={<Fish className="h-5 w-5" />}
            tint="bg-emerald-100 text-emerald-700"
            title="Personalized Fish Recommendations"
            body="A 28-species nutrient database filters by your deficiency, water type, region, and farming capacity — recommending the right fish to close your nutrient gap."
          />
          <FeatureRow
            icon={<Sprout className="h-5 w-5" />}
            tint="bg-amber-100 text-amber-700"
            title="Terrace Aquaculture Guide"
            body="Tank sizes, water type, feeding and species choice for rooftop and backyard aquaponic systems — sustainable food self-sufficiency for any household."
          />
          <FeatureRow
            icon={<Heart className="h-5 w-5" />}
            tint="bg-rose-100 text-rose-700"
            title="Progress Tracking"
            body="Every scan builds your personal health timeline. Spot recurring deficiencies, track improvement, and adjust your diet accordingly."
          />
        </div>
      </section>

      <div className="flex items-center justify-center gap-2 pt-2 pb-4 text-[11px] text-slate-400">
        <Droplets className="h-3 w-3" />
        AQUANUTRI · Skin AI for Nutrition · v1.0
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  tint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  tint: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-3 border border-slate-200 shadow-sm">
      <div className={`inline-flex h-7 w-7 rounded-lg items-center justify-center ${tint} mb-2`}>
        {icon}
      </div>
      <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className="font-bold text-slate-800 text-base leading-tight">{value}</p>
      <p className="text-[10px] text-slate-500">{sub}</p>
    </div>
  );
}

function HeroStat({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl bg-white/10 backdrop-blur ring-1 ring-white/20 p-4">
      <div className="inline-flex h-8 w-8 rounded-lg items-center justify-center bg-white/15 mb-2">
        {icon}
      </div>
      <p className="text-[10px] uppercase tracking-wider text-teal-50/80">{label}</p>
      <p className="font-bold text-white text-lg leading-tight">{value}</p>
      <p className="text-[10px] text-teal-50/70">{sub}</p>
    </div>
  );
}

function FeatureRow({
  icon,
  tint,
  title,
  body,
}: {
  icon: React.ReactNode;
  tint: string;
  title: string;
  body: string;
}) {
  return (
    <Card className="border-slate-200 shadow-sm h-full">
      <CardContent className="p-4 lg:p-5 flex flex-col gap-3">
        <div className={`h-10 w-10 rounded-xl ${tint} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{body}</p>
        </div>
      </CardContent>
    </Card>
  );
}
