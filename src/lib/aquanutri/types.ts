/**
 * AQUANUTRI - Shared TypeScript types
 */

export type DeficiencyClass =
  | "iron_deficiency"
  | "vitamin_b12_deficiency"
  | "vitamin_d_deficiency"
  | "zinc_deficiency"
  | "vitamin_a_deficiency"
  | "healthy";

export type WaterType = "freshwater" | "brackish" | "marine";

export type Severity = "none" | "minimal" | "mild" | "moderate" | "severe";

export interface Prediction {
  class: DeficiencyClass;
  label: string;
  confidence: number;            // 0..1
  nutrient: string;
  description: string;
  symptoms: string[];
}

export interface PredictionResponse {
  top: Prediction;
  severity: Severity;
  secondary: { class: DeficiencyClass; label: string; confidence: number }[];
  all: Prediction[];
  model: string;
}

export interface FishSpecies {
  species: string;
  water_type: WaterType;
  key_nutrients: string;
  deficiencies_addressed: string;
  protein_g: number;
  omega3_mg: number;
  iron_mg: number;
  zinc_mg: number;
  vitamin_b12_ug: number;
  vitamin_d_ug: number;
  iodine_ug: number;
  vitamin_a_ug: number;
  region: string;
  farming_suitable: 0 | 1;
  tank_size_liters: number;
  difficulty: "easy" | "medium" | "hard";
  notes: string;
}

export interface RecommendationFilters {
  deficiencies: DeficiencyClass[];      // detected deficiencies
  waterTypes: WaterType[];              // user-selected water types
  region?: string;                      // user country/region
  farmingOnly?: boolean;                // only show farming-suitable species
  maxDifficulty?: "easy" | "medium" | "hard";
}

export interface RankedFish extends FishSpecies {
  matchScore: number;                    // 0..1, how well it matches the deficiencies
  matchedNutrients: string[];
  matchedDeficiencies: DeficiencyClass[];
}

export interface ScanRecord {
  id: string;
  timestamp: number;                    // epoch ms
  imageUrl: string;                     // data URL of the captured image (thumbnail)
  topClass: DeficiencyClass;
  topLabel: string;
  confidence: number;
  severity: Severity;
  secondary: { class: DeficiencyClass; label: string; confidence: number }[];
}

export interface TrainingHistory {
  stage_a: {
    accuracy: number[];
    val_accuracy: number[];
    loss: number[];
    val_loss: number[];
  };
  stage_b: {
    accuracy: number[];
    val_accuracy: number[];
    loss: number[];
    val_loss: number[];
  };
  final_val_accuracy: number;
  final_val_loss: number;
  class_names: string[];
}
