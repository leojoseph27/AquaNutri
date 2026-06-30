"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import {
  Trash2,
  Activity,
  TrendingDown,
  TrendingUp,
  Calendar,
  Camera,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { getScans, deleteScan, clearScans } from "@/lib/aquanutri/storage";
import type { ScanRecord, TrainingHistory } from "@/lib/aquanutri/types";
import { SEVERITY_META, formatDate } from "@/lib/aquanutri/ui";

export function TimelineScreen() {
  const [scans, setScans] = useState<ScanRecord[]>(() => getScans());
  const [history, setHistory] = useState<TrainingHistory | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/training-history")
      .then((r) => r.json())
      .then((d) => { if (!cancelled && d.available) setHistory(d); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setHistoryLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleDelete = (id: string) => {
    setScans(deleteScan(id));
  };
  const handleClear = () => {
    if (confirm("Clear all scan history? This cannot be undone.")) {
      clearScans();
      setScans([]);
    }
  };

  // Build chart data: scans over time, severity encoded as numeric score
  const trendData = useMemo(() => {
    return [...scans]
      .reverse()
      .filter((s) => s.topClass !== "healthy")
      .map((s) => ({
        date: new Date(s.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        confidence: Math.round(s.confidence * 100),
        severity: severityToScore(s.severity),
        label: s.topLabel,
      }));
  }, [scans]);

  // Aggregate counts
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const s of scans) {
      c[s.topLabel] = (c[s.topLabel] || 0) + 1;
    }
    return Object.entries(c).sort((a, b) => b[1] - a[1]);
  }, [scans]);

  const totalScans = scans.length;
  const healthyScans = scans.filter((s) => s.topClass === "healthy").length;
  const flaggedScans = totalScans - healthyScans;
  const improvingTrend = trendData.length >= 2 && trendData[trendData.length - 1].confidence < trendData[0].confidence;

  return (
    <div className="space-y-4">
      <div className="px-1 lg:hidden">
        <h1 className="text-xl font-bold text-slate-800">Your Health Timeline</h1>
        <p className="text-sm text-slate-600 mt-1">
          Track your nutritional health over time. Each scan you take is logged
          here automatically so you can see patterns and improvement.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard
          label="Total scans"
          value={String(totalScans)}
          icon={<Calendar className="h-4 w-4" />}
          tint="text-slate-700 bg-slate-100"
        />
        <SummaryCard
          label="Flagged"
          value={String(flaggedScans)}
          icon={<AlertTriangle className="h-4 w-4" />}
          tint="text-amber-700 bg-amber-100"
        />
        <SummaryCard
          label="Healthy"
          value={String(healthyScans)}
          icon={<ShieldCheck className="h-4 w-4" />}
          tint="text-emerald-700 bg-emerald-100"
        />
      </div>

      {/* Trend chart */}
      {trendData.length >= 2 ? (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-teal-600" />
                <h3 className="text-sm font-semibold text-slate-700">Deficiency confidence trend</h3>
              </div>
              {improvingTrend !== null && (
                <Badge variant="outline" className={`text-xs ${improvingTrend ? "text-emerald-700 border-emerald-200 bg-emerald-50" : "text-amber-700 border-amber-200 bg-amber-50"}`}>
                  {improvingTrend ? <TrendingDown className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1" />}
                  {improvingTrend ? "Improving" : "Watch"}
                </Badge>
              )}
            </div>
            <div className="h-56 lg:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }}
                  />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey="confidence" stroke="#0d9488" strokeWidth={2} dot={{ r: 3 }} name="Confidence %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-slate-200 border-dashed bg-slate-50">
          <CardContent className="p-6 text-center">
            <Activity className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-600 font-medium">Take at least 2 flagged scans</p>
            <p className="text-xs text-slate-500 mt-1">
              Once you have multiple scans, you'll see a trend chart showing how your
              deficiency confidence changes over time.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Most common */}
      {counts.length > 0 && (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Most common findings</h3>
            <div className="space-y-2">
              {counts.slice(0, 5).map(([label, count]) => {
                const pct = Math.round((count / totalScans) * 100);
                return (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-700">{label}</span>
                      <span className="text-slate-500">{count} · {pct}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-400 to-emerald-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* History list */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-semibold text-slate-700">Scan history</h3>
          {scans.length > 0 && (
            <Button onClick={handleClear} variant="ghost" size="sm" className="text-rose-600 hover:text-rose-700 h-7">
              <Trash2 className="h-3 w-3 mr-1" /> Clear all
            </Button>
          )}
        </div>

        {scans.length === 0 ? (
          <Card className="border-slate-200 border-dashed">
            <CardContent className="p-8 text-center">
              <Camera className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-600">No scans yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Use the Scan tab to capture a skin image. Your results will appear
                here automatically.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 gap-2.5">
            {scans.map((s) => {
              const sev = SEVERITY_META[s.severity];
              return (
                <Card key={s.id} className="border-slate-200 shadow-sm">
                  <CardContent className="p-3 flex items-center gap-3">
                    {s.imageUrl ? (
                      <img
                        src={s.imageUrl}
                        alt="scan"
                        className="h-12 w-12 rounded-lg object-cover ring-1 ring-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        <Camera className="h-4 w-4 text-slate-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">{s.topLabel}</p>
                      <p className="text-[11px] text-slate-500">{formatDate(s.timestamp)}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-mono text-slate-600">
                          {(s.confidence * 100).toFixed(1)}%
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${sev.bg} ${sev.color}`}>
                          {sev.label}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="h-7 w-7 rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center shrink-0"
                      aria-label="Delete scan"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Model training chart (Fig. 7 from the paper) */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-700">ResNet50 training curves</h3>
              <p className="text-[11px] text-slate-500">Stage A: head training · Stage B: fine-tuning</p>
            </div>
            {history && (
              <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50">
                Final val acc: {(history.final_val_accuracy * 100).toFixed(1)}%
              </Badge>
            )}
          </div>
          {historyLoading ? (
            <div className="h-48 bg-slate-50 animate-pulse rounded-lg" />
          ) : history ? (
            <TrainingChart history={history} />
          ) : (
            <div className="h-48 flex items-center justify-center text-xs text-slate-500">
              Training history unavailable.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TrainingChart({ history }: { history: TrainingHistory }) {
  const data = [
    ...history.stage_a.accuracy.map((a, i) => ({
      epoch: `A${i + 1}`,
      acc: a * 100,
      val_acc: history.stage_a.val_accuracy[i] * 100,
      loss: history.stage_a.loss[i],
      val_loss: history.stage_a.val_loss[i],
    })),
    ...history.stage_b.accuracy.map((a, i) => ({
      epoch: `B${i + 1}`,
      acc: a * 100,
      val_acc: history.stage_b.val_accuracy[i] * 100,
      loss: history.stage_b.loss[i],
      val_loss: history.stage_b.val_loss[i],
    })),
  ];
  return (
    <div className="h-56 lg:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="epoch" tick={{ fontSize: 10 }} stroke="#94a3b8" />
          <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} />
          <Legend wrapperStyle={{ fontSize: 10 }} />
          <Line type="monotone" dataKey="acc" stroke="#0d9488" strokeWidth={2} dot={{ r: 3 }} name="Train Acc %" />
          <Line type="monotone" dataKey="val_acc" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} name="Val Acc %" />
          <Line type="monotone" dataKey="loss" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="Train Loss" />
          <Line type="monotone" dataKey="val_loss" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} name="Val Loss" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  tint,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tint: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-3 border border-slate-200 shadow-sm">
      <div className={`inline-flex h-7 w-7 rounded-lg items-center justify-center ${tint} mb-1.5`}>
        {icon}
      </div>
      <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className="font-bold text-slate-800 text-lg leading-tight">{value}</p>
    </div>
  );
}

function severityToScore(sev: string): number {
  return { none: 0, minimal: 25, mild: 50, moderate: 75, severe: 100 }[sev] ?? 0;
}
