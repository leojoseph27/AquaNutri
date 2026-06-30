/**
 * AQUANUTRI - Local scan history (timeline) storage.
 *
 * Implements the "Progress Tracking and Personal Health Timeline" feature
 * described in section 4.D of the paper. Uses localStorage so no auth is
 * required and scans persist per-device.
 */
import type { ScanRecord } from "./types";

const KEY = "aquanutri:scans";
const MAX_RECORDS = 100;

export function getScans(): ScanRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ScanRecord[];
    return Array.isArray(parsed) ? parsed.sort((a, b) => b.timestamp - a.timestamp) : [];
  } catch {
    return [];
  }
}

export function saveScan(record: ScanRecord): ScanRecord[] {
  if (typeof window === "undefined") return [];
  const existing = getScans();
  const next = [record, ...existing].slice(0, MAX_RECORDS);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch (e) {
    // localStorage may overflow with data URLs - drop image and retry
    const slim = next.map((r) => ({ ...r, imageUrl: "" }));
    window.localStorage.setItem(KEY, JSON.stringify(slim));
  }
  return next;
}

export function deleteScan(id: string): ScanRecord[] {
  if (typeof window === "undefined") return [];
  const next = getScans().filter((s) => s.id !== id);
  window.localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function clearScans(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

export function newScanId(): string {
  return `scan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
