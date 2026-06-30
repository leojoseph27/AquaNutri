/**
 * Severity -> color helpers for the AQUANUTRI UI.
 * Used to colour-code urgency indicators per section 4.A of the paper.
 */
import type { Severity } from "./types";

export const SEVERITY_META: Record<
  Severity,
  { label: string; color: string; bg: string; ring: string; dot: string }
> = {
  none:     { label: "None",        color: "text-emerald-700", bg: "bg-emerald-50",  ring: "ring-emerald-200", dot: "bg-emerald-500" },
  minimal:  { label: "Minimal",     color: "text-teal-700",    bg: "bg-teal-50",     ring: "ring-teal-200",    dot: "bg-teal-500" },
  mild:     { label: "Mild",        color: "text-amber-700",   bg: "bg-amber-50",    ring: "ring-amber-200",   dot: "bg-amber-500" },
  moderate: { label: "Moderate",    color: "text-orange-700",  bg: "bg-orange-50",   ring: "ring-orange-200",  dot: "bg-orange-500" },
  severe:   { label: "Severe",      color: "text-red-700",     bg: "bg-red-50",      ring: "ring-red-200",     dot: "bg-red-500" },
};

export function severityFromConfidence(class_: string, confidence: number): Severity {
  if (class_ === "healthy") return "none";
  if (confidence >= 0.85) return "severe";
  if (confidence >= 0.72) return "moderate";
  if (confidence >= 0.55) return "mild";
  return "minimal";
}

export function confidencePct(c: number): string {
  return `${(c * 100).toFixed(1)}%`;
}

export const WATER_TYPE_META: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  freshwater: { label: "Freshwater", color: "text-emerald-700", bg: "bg-emerald-100", icon: "🐟" },
  brackish:   { label: "Brackish",   color: "text-teal-700",    bg: "bg-teal-100",    icon: "🌊" },
  marine:     { label: "Marine",     color: "text-cyan-700",    bg: "bg-cyan-100",    icon: "🐠" },
};

export const DIFFICULTY_META: Record<string, { label: string; color: string; bg: string }> = {
  easy:   { label: "Beginner-friendly", color: "text-emerald-700", bg: "bg-emerald-100" },
  medium: { label: "Intermediate",      color: "text-amber-700",   bg: "bg-amber-100" },
  hard:   { label: "Advanced",          color: "text-rose-700",    bg: "bg-rose-100" },
};

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
