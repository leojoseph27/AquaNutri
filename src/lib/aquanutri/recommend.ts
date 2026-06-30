/**
 * AQUANUTRI - Fish recommendation engine.
 *
 * Implements the personalized recommendation logic described in section 3.B:
 *   "Based on detected deficiencies, the system accesses a fish nutrient
 *    database and applies filters using user inputs such as water type and
 *    geographic location. Suitable fish species are then recommended."
 *
 * Scoring is a weighted combination of:
 *   - deficiency match (does this fish address the detected deficiencies?)
 *   - nutrient density (how much of the deficient nutrient per 100g?)
 *   - filter compliance (water type, region, farming suitability, difficulty)
 */
import { getFishDb, DEFICIENCY_NUTRIENT_MAP, NUTRIENT_COLUMN_MAP } from "./fish-data";
import type {
  DeficiencyClass,
  FishSpecies,
  RankedFish,
  RecommendationFilters,
  WaterType,
} from "./types";

const DIFFICULTY_RANK: Record<FishSpecies["difficulty"], number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};

/** Returns a per-100g "richness" score in 0..1 for a given nutrient column. */
function richness(value: number, all: number[]): number {
  if (!all.length) return 0;
  const max = Math.max(...all);
  if (max <= 0) return 0;
  return Math.min(1, value / max);
}

export function recommendFish(filters: RecommendationFilters): RankedFish[] {
  const db = getFishDb();

  // Pre-compute max per nutrient column (for normalisation).
  const maxByCol: Record<string, number> = {};
  for (const col of Object.values(NUTRIENT_COLUMN_MAP)) {
    maxByCol[col as string] = Math.max(...db.map((f) => Number(f[col as keyof FishSpecies]) || 0));
  }

  const waterTypes = filters.waterTypes?.length ? filters.waterTypes : (["freshwater", "brackish", "marine"] as WaterType[]);

  const scored: RankedFish[] = db
    .filter((f) => waterTypes.includes(f.water_type))
    .filter((f) => (filters.farmingOnly ? f.farming_suitable === 1 : true))
    .filter((f) => {
      if (!filters.maxDifficulty) return true;
      return DIFFICULTY_RANK[f.difficulty] <= DIFFICULTY_RANK[filters.maxDifficulty];
    })
    .filter((f) => {
      if (!filters.region) return true;
      return f.region.toLowerCase().includes(filters.region.toLowerCase());
    })
    .map((f) => {
      const matchedNutrients: string[] = [];
      const matchedDeficiencies: DeficiencyClass[] = [];

      let score = 0;

      for (const def of filters.deficiencies) {
        const neededNutrients = DEFICIENCY_NUTRIENT_MAP[def] || [];
        const fishAddressed = f.deficiencies_addressed
          .split(",")
          .map((s) => s.trim()) as DeficiencyClass[];

        const addressesThisDef = fishAddressed.includes(def);

        // Sum richness across needed nutrients
        let nutrScore = 0;
        for (const nutr of neededNutrients) {
          const col = NUTRIENT_COLUMN_MAP[nutr];
          if (!col) continue;
          const value = Number(f[col as keyof FishSpecies]) || 0;
          const r = richness(value, db.map((x) => Number(x[col as keyof FishSpecies]) || 0));
          nutrScore += r;
          if (r > 0.25 && !matchedNutrients.includes(nutr)) {
            matchedNutrients.push(nutr);
          }
        }
        nutrScore /= Math.max(1, neededNutrients.length);

        // Weighted: direct addressing is the biggest boost
        if (addressesThisDef) {
          score += 0.55;
          matchedDeficiencies.push(def);
        }
        score += 0.35 * nutrScore;
      }

      // Small bonus for farming-suitable species when user is doing terrace aquaculture
      if (filters.farmingOnly && f.farming_suitable === 1) score += 0.05;

      // Small bonus for easy difficulty
      if (f.difficulty === "easy") score += 0.03;
      else if (f.difficulty === "medium") score += 0.01;

      // Clamp
      score = Math.max(0, Math.min(1, score));

      return { ...f, matchScore: score, matchedNutrients, matchedDeficiencies };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  return scored;
}
