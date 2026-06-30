/**
 * AQUANUTRI - Fish nutrient database loader.
 * Loads the CSV at runtime (server-side only) and caches it in memory.
 */
import { readFileSync, existsSync } from "fs";
import path from "path";
import type { FishSpecies } from "./types";

const CSV_PATH = path.join(process.cwd(), "ml", "data", "fish_nutrients.csv");

let cache: FishSpecies[] | null = null;

/**
 * Minimal RFC-4180-compliant CSV parser that handles quoted fields with
 * embedded commas, double-quote escapes, and CRLF line endings.
 */
function parseCsvRow(line: string): string[] {
  const cells: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        cells.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
  }
  cells.push(cur);
  return cells;
}

function parseCsv(text: string): FishSpecies[] {
  const lines = text.trim().split(/\r?\n/);
  const headers = parseCsvRow(lines[0]);
  const rows: FishSpecies[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const cells = parseCsvRow(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h] = cells[idx] ?? "";
    });
    rows.push({
      species: obj.species,
      water_type: obj.water_type as FishSpecies["water_type"],
      key_nutrients: obj.key_nutrients,
      deficiencies_addressed: obj.deficiencies_addressed,
      protein_g: parseFloat(obj.protein_g) || 0,
      omega3_mg: parseFloat(obj.omega3_mg) || 0,
      iron_mg: parseFloat(obj.iron_mg) || 0,
      zinc_mg: parseFloat(obj.zinc_mg) || 0,
      vitamin_b12_ug: parseFloat(obj.vitamin_b12_ug) || 0,
      vitamin_d_ug: parseFloat(obj.vitamin_d_ug) || 0,
      iodine_ug: parseFloat(obj.iodine_ug) || 0,
      vitamin_a_ug: parseFloat(obj.vitamin_a_ug) || 0,
      region: obj.region,
      farming_suitable: (obj.farming_suitable === "1" ? 1 : 0),
      tank_size_liters: parseInt(obj.tank_size_liters, 10) || 0,
      difficulty: obj.difficulty as FishSpecies["difficulty"],
      notes: obj.notes,
    });
  }
  return rows;
}

export function getFishDb(): FishSpecies[] {
  if (cache) return cache;
  if (!existsSync(CSV_PATH)) {
    console.warn("[fish-db] CSV not found at", CSV_PATH);
    cache = [];
    return cache;
  }
  const text = readFileSync(CSV_PATH, "utf-8");
  cache = parseCsv(text);
  return cache;
}

/** Deficiency -> key nutrients that should be replenished. */
export const DEFICIENCY_NUTRIENT_MAP: Record<string, string[]> = {
  iron_deficiency:        ["iron", "vitamin_b12", "vitamin_c"],
  vitamin_b12_deficiency: ["vitamin_b12", "iron", "folate"],
  vitamin_d_deficiency:   ["vitamin_d", "calcium", "omega3"],
  zinc_deficiency:        ["zinc", "protein", "vitamin_a"],
  vitamin_a_deficiency:   ["vitamin_a", "zinc", "iodine"],
  healthy:                [],
};

/** Maps a nutrient name to the matching FishSpecies numeric column. */
export const NUTRIENT_COLUMN_MAP: Record<string, keyof FishSpecies> = {
  iron: "iron_mg",
  vitamin_b12: "vitamin_b12_ug",
  vitamin_d: "vitamin_d_ug",
  zinc: "zinc_mg",
  vitamin_a: "vitamin_a_ug",
  iodine: "iodine_ug",
  omega3: "omega3_mg",
  protein: "protein_g",
  calcium: "protein_g",   // proxy - calcium-rich small fish also tend to be protein-rich
  folate: "protein_g",    // proxy
  vitamin_c: "protein_g", // proxy
};
