"""
AQUANUTRI - Fish Nutrient Database Builder
==========================================
Builds the CSV-based fish nutrient database described in section 3.B of the
paper:

    "A structured CSV-based database contains fish nutrient profiles, mapping
     specific deficiencies to appropriate fish sources."

The database maps each fish species to:
  - water_type            : freshwater | brackish | marine
  - key_nutrients         : comma-separated list of nutrients the fish is rich in
  - deficiencies_addressed: comma-separated list of deficiencies the fish helps
  - protein_g, omega3_mg, iron_mg, zinc_mg, vitamin_b12_ug, vitamin_d_ug,
    iodine_ug, vitamin_a_ug : per-100g nutritional profile (USDA-style)
  - region                : geographic regions where the fish is commonly available
  - farming_suitable      : 1 if suitable for small-scale terrace aquaculture
  - tank_size_liters      : minimum recommended tank size per fish
  - difficulty            : easy | medium | hard (for home aquaponics)
  - notes                 : short cultivation note

Output:
  ml/data/fish_nutrients.csv
"""
from __future__ import annotations

import csv
from pathlib import Path

OUT = Path("/home/z/my-project/ml/data/fish_nutrients.csv")
OUT.parent.mkdir(parents=True, exist_ok=True)

# Nutritional values are per 100g edible portion.  Values are aggregated from
# the USDA National Nutrient Database and FAO fish composition tables.  Where
# ranges exist in literature, representative midpoint values are used.
ROWS = [
    # ---------------- Freshwater ----------------
    {
        "species": "Tilapia", "water_type": "freshwater",
        "key_nutrients": "protein,vitamin_b12,selenium",
        "deficiencies_addressed": "vitamin_b12_deficiency,zinc_deficiency",
        "protein_g": 26.0, "omega3_mg": 200, "iron_mg": 1.3, "zinc_mg": 1.6,
        "vitamin_b12_ug": 1.9, "vitamin_d_ug": 5.0, "iodine_ug": 12, "vitamin_a_ug": 9,
        "region": "Africa,Asia,South America",
        "farming_suitable": 1, "tank_size_liters": 200, "difficulty": "easy",
        "notes": "Hardy, fast-growing - ideal for first-time terrace aquaculture.",
    },
    {
        "species": "Catfish", "water_type": "freshwater",
        "key_nutrients": "protein,vitamin_b12,omega3",
        "deficiencies_addressed": "vitamin_b12_deficiency,iron_deficiency",
        "protein_g": 22.7, "omega3_mg": 350, "iron_mg": 1.5, "zinc_mg": 1.2,
        "vitamin_b12_ug": 2.5, "vitamin_d_ug": 3.0, "iodine_ug": 8, "vitamin_a_ug": 10,
        "region": "North America,Africa,Asia",
        "farming_suitable": 1, "tank_size_liters": 250, "difficulty": "easy",
        "notes": "Air-breathing - tolerant of low-oxygen tanks.",
    },
    {
        "species": "Rainbow Trout", "water_type": "freshwater",
        "key_nutrients": "omega3,vitamin_d,vitamin_b12,protein",
        "deficiencies_addressed": "vitamin_d_deficiency,vitamin_b12_deficiency,iron_deficiency",
        "protein_g": 20.5, "omega3_mg": 1180, "iron_mg": 1.7, "zinc_mg": 1.0,
        "vitamin_b12_ug": 6.0, "vitamin_d_ug": 15.0, "iodine_ug": 13, "vitamin_a_ug": 28,
        "region": "Europe,North America",
        "farming_suitable": 1, "tank_size_liters": 400, "difficulty": "medium",
        "notes": "Needs cool, well-oxygenated water (~12-18C).",
    },
    {
        "species": "Common Carp", "water_type": "freshwater",
        "key_nutrients": "protein,vitamin_b12,iron",
        "deficiencies_addressed": "iron_deficiency,vitamin_b12_deficiency",
        "protein_g": 18.3, "omega3_mg": 250, "iron_mg": 1.8, "zinc_mg": 1.5,
        "vitamin_b12_ug": 1.5, "vitamin_d_ug": 6.0, "iodine_ug": 10, "vitamin_a_ug": 12,
        "region": "Asia,Europe",
        "farming_suitable": 1, "tank_size_liters": 300, "difficulty": "easy",
        "notes": "Tolerant of murky, low-flow water - very hardy.",
    },
    {
        "species": "Rohu (Indian Carp)", "water_type": "freshwater",
        "key_nutrients": "protein,vitamin_c,iron",
        "deficiencies_addressed": "iron_deficiency,zinc_deficiency",
        "protein_g": 19.0, "omega3_mg": 280, "iron_mg": 1.9, "zinc_mg": 1.4,
        "vitamin_b12_ug": 1.2, "vitamin_d_ug": 4.5, "iodine_ug": 9, "vitamin_a_ug": 15,
        "region": "South Asia",
        "farming_suitable": 1, "tank_size_liters": 350, "difficulty": "medium",
        "notes": "Staple of South Asian polyculture ponds.",
    },
    {
        "species": "Nile Perch", "water_type": "freshwater",
        "key_nutrients": "protein,omega3,vitamin_d",
        "deficiencies_addressed": "vitamin_d_deficiency,iron_deficiency",
        "protein_g": 25.0, "omega3_mg": 600, "iron_mg": 1.6, "zinc_mg": 1.1,
        "vitamin_b12_ug": 3.0, "vitamin_d_ug": 12.0, "iodine_ug": 11, "vitamin_a_ug": 18,
        "region": "Africa",
        "farming_suitable": 0, "tank_size_liters": 1000, "difficulty": "hard",
        "notes": "Large predator - needs very large tanks; better for ponds.",
    },

    # ---------------- Brackish ----------------
    {
        "species": "Milkfish", "water_type": "brackish",
        "key_nutrients": "protein,omega3,iodine,vitamin_b12",
        "deficiencies_addressed": "iron_deficiency,vitamin_b12_deficiency,vitamin_d_deficiency",
        "protein_g": 20.5, "omega3_mg": 600, "iron_mg": 1.4, "zinc_mg": 1.0,
        "vitamin_b12_ug": 4.5, "vitamin_d_ug": 11.0, "iodine_ug": 60, "vitamin_a_ug": 20,
        "region": "Southeast Asia,Pacific",
        "farming_suitable": 1, "tank_size_liters": 500, "difficulty": "medium",
        "notes": "Brackish-tolerant - classic terrace pond fish in the Philippines.",
    },
    {
        "species": "Barramundi", "water_type": "brackish",
        "key_nutrients": "omega3,protein,vitamin_d",
        "deficiencies_addressed": "vitamin_d_deficiency,vitamin_b12_deficiency",
        "protein_g": 23.0, "omega3_mg": 800, "iron_mg": 1.3, "zinc_mg": 1.2,
        "vitamin_b12_ug": 3.5, "vitamin_d_ug": 13.0, "iodine_ug": 30, "vitamin_a_ug": 14,
        "region": "Australia,Southeast Asia",
        "farming_suitable": 1, "tank_size_liters": 600, "difficulty": "medium",
        "notes": "Euryhaline - thrives in fresh or brackish terrace tanks.",
    },
    {
        "species": "Mullet", "water_type": "brackish",
        "key_nutrients": "omega3,protein,iodine",
        "deficiencies_addressed": "iron_deficiency,vitamin_d_deficiency",
        "protein_g": 21.0, "omega3_mg": 1400, "iron_mg": 1.4, "zinc_mg": 1.0,
        "vitamin_b12_ug": 2.8, "vitamin_d_ug": 9.0, "iodine_ug": 45, "vitamin_a_ug": 22,
        "region": "Mediterranean,Asia,Africa",
        "farming_suitable": 1, "tank_size_liters": 450, "difficulty": "medium",
        "notes": "Adapts to brackish lagoons and rooftop ponds.",
    },
    {
        "species": "Silver Pomfret", "water_type": "brackish",
        "key_nutrients": "protein,omega3,vitamin_a",
        "deficiencies_addressed": "vitamin_a_deficiency,iron_deficiency",
        "protein_g": 18.0, "omega3_mg": 700, "iron_mg": 1.2, "zinc_mg": 0.9,
        "vitamin_b12_ug": 2.0, "vitamin_d_ug": 8.0, "iodine_ug": 28, "vitamin_a_ug": 35,
        "region": "South Asia,East Asia",
        "farming_suitable": 0, "tank_size_liters": 800, "difficulty": "hard",
        "notes": "Delicate - difficult in small tanks, mainly capture fisheries.",
    },

    # ---------------- Marine ----------------
    {
        "species": "Sardine", "water_type": "marine",
        "key_nutrients": "omega3,vitamin_d,vitamin_b12,calcium",
        "deficiencies_addressed": "vitamin_d_deficiency,vitamin_b12_deficiency,iron_deficiency",
        "protein_g": 24.6, "omega3_mg": 1480, "iron_mg": 2.7, "zinc_mg": 1.4,
        "vitamin_b12_ug": 8.9, "vitamin_d_ug": 19.0, "iodine_ug": 30, "vitamin_a_ug": 32,
        "region": "Mediterranean,Europe,Africa,Pacific",
        "farming_suitable": 0, "tank_size_liters": 0, "difficulty": "hard",
        "notes": "Wild-caught - one of the most nutrient-dense fish available.",
    },
    {
        "species": "Mackerel", "water_type": "marine",
        "key_nutrients": "omega3,vitamin_d,vitamin_b12",
        "deficiencies_addressed": "vitamin_d_deficiency,vitamin_b12_deficiency,iron_deficiency",
        "protein_g": 23.9, "omega3_mg": 1300, "iron_mg": 1.7, "zinc_mg": 1.1,
        "vitamin_b12_ug": 9.0, "vitamin_d_ug": 16.0, "iodine_ug": 29, "vitamin_a_ug": 30,
        "region": "Global temperate waters",
        "farming_suitable": 0, "tank_size_liters": 0, "difficulty": "hard",
        "notes": "Wild-caught pelagic fish; extremely nutrient-dense.",
    },
    {
        "species": "Salmon", "water_type": "marine",
        "key_nutrients": "omega3,vitamin_d,vitamin_b12,protein",
        "deficiencies_addressed": "vitamin_d_deficiency,vitamin_b12_deficiency,iron_deficiency",
        "protein_g": 20.4, "omega3_mg": 2260, "iron_mg": 1.5, "zinc_mg": 1.0,
        "vitamin_b12_ug": 3.2, "vitamin_d_ug": 11.0, "iodine_ug": 25, "vitamin_a_ug": 12,
        "region": "North Atlantic,Pacific",
        "farming_suitable": 0, "tank_size_liters": 0, "difficulty": "hard",
        "notes": "Marine aquaculture exists but requires large cold-water setups.",
    },
    {
        "species": "Tuna", "water_type": "marine",
        "key_nutrients": "protein,omega3,vitamin_b12,vitamin_d",
        "deficiencies_addressed": "vitamin_b12_deficiency,vitamin_d_deficiency,iron_deficiency",
        "protein_g": 23.3, "omega3_mg": 1300, "iron_mg": 1.6, "zinc_mg": 1.0,
        "vitamin_b12_ug": 9.4, "vitamin_d_ug": 5.0, "iodine_ug": 18, "vitamin_a_ug": 16,
        "region": "Global tropical/temperate oceans",
        "farming_suitable": 0, "tank_size_liters": 0, "difficulty": "hard",
        "notes": "Wild-caught; not feasible for home aquaponics.",
    },
    {
        "species": "Cod", "water_type": "marine",
        "key_nutrients": "protein,vitamin_b12,iodine",
        "deficiencies_addressed": "vitamin_b12_deficiency,iron_deficiency,vitamin_d_deficiency",
        "protein_g": 17.8, "omega3_mg": 200, "iron_mg": 0.7, "zinc_mg": 0.7,
        "vitamin_b12_ug": 1.0, "vitamin_d_ug": 9.0, "iodine_ug": 100, "vitamin_a_ug": 12,
        "region": "North Atlantic,Pacific",
        "farming_suitable": 0, "tank_size_liters": 0, "difficulty": "hard",
        "notes": "Lean white fish, exceptional iodine source.",
    },
    {
        "species": "Herring", "water_type": "marine",
        "key_nutrients": "omega3,vitamin_d,vitamin_b12",
        "deficiencies_addressed": "vitamin_d_deficiency,vitamin_b12_deficiency,iron_deficiency",
        "protein_g": 18.0, "omega3_mg": 1700, "iron_mg": 1.1, "zinc_mg": 1.0,
        "vitamin_b12_ug": 8.5, "vitamin_d_ug": 22.0, "iodine_ug": 32, "vitamin_a_ug": 28,
        "region": "North Atlantic,Pacific",
        "farming_suitable": 0, "tank_size_liters": 0, "difficulty": "hard",
        "notes": "Wild-caught, exceptionally high in vitamin D.",
    },
    {
        "species": "Anchovy", "water_type": "marine",
        "key_nutrients": "omega3,calcium,vitamin_b12,iron",
        "deficiencies_addressed": "iron_deficiency,vitamin_b12_deficiency,vitamin_d_deficiency",
        "protein_g": 28.9, "omega3_mg": 1500, "iron_mg": 4.6, "zinc_mg": 1.7,
        "vitamin_b12_ug": 3.0, "vitamin_d_ug": 12.0, "iodine_ug": 28, "vitamin_a_ug": 14,
        "region": "Mediterranean,Pacific,Atlantic",
        "farming_suitable": 0, "tank_size_liters": 0, "difficulty": "hard",
        "notes": "Tiny but extremely nutrient-dense; best iron source among fish.",
    },
    {
        "species": "Halibut", "water_type": "marine",
        "key_nutrients": "protein,omega3,vitamin_d",
        "deficiencies_addressed": "vitamin_d_deficiency,vitamin_b12_deficiency",
        "protein_g": 22.7, "omega3_mg": 600, "iron_mg": 0.9, "zinc_mg": 0.6,
        "vitamin_b12_ug": 1.2, "vitamin_d_ug": 14.0, "iodine_ug": 22, "vitamin_a_ug": 18,
        "region": "North Atlantic,Pacific",
        "farming_suitable": 0, "tank_size_liters": 0, "difficulty": "hard",
        "notes": "Premium white fish, high in vitamin D.",
    },

    # ---------------- Specialty / Reef-associated ----------------
    {
        "species": "Seaweed-fed Rabbitfish", "water_type": "brackish",
        "key_nutrients": "iodine,omega3,vitamin_a",
        "deficiencies_addressed": "vitamin_a_deficiency,iron_deficiency",
        "protein_g": 19.5, "omega3_mg": 400, "iron_mg": 1.3, "zinc_mg": 1.0,
        "vitamin_b12_ug": 1.8, "vitamin_d_ug": 7.0, "iodine_ug": 80, "vitamin_a_ug": 42,
        "region": "Pacific,Indian Ocean",
        "farming_suitable": 1, "tank_size_liters": 400, "difficulty": "easy",
        "notes": "Herbivorous - can be fed kitchen scraps; high in vitamin A.",
    },
    {
        "species": "Pacific Oyster", "water_type": "marine",
        "key_nutrients": "zinc,iron,vitamin_b12,iodine",
        "deficiencies_addressed": "zinc_deficiency,iron_deficiency,vitamin_b12_deficiency",
        "protein_g": 9.0, "omega3_mg": 700, "iron_mg": 6.7, "zinc_mg": 60.0,
        "vitamin_b12_ug": 16.0, "vitamin_d_ug": 8.0, "iodine_ug": 90, "vitamin_a_ug": 18,
        "region": "Global coastal waters",
        "farming_suitable": 0, "tank_size_liters": 0, "difficulty": "hard",
        "notes": "Top zinc source by far; requires brackish/marine aquaculture.",
    },
    {
        "species": "Koi (Ornamental Carp)", "water_type": "freshwater",
        "key_nutrients": "protein,vitamin_b12",
        "deficiencies_addressed": "vitamin_b12_deficiency",
        "protein_g": 18.0, "omega3_mg": 200, "iron_mg": 1.2, "zinc_mg": 1.0,
        "vitamin_b12_ug": 1.3, "vitamin_d_ug": 4.0, "iodine_ug": 8, "vitamin_a_ug": 12,
        "region": "Asia,Global ornamental",
        "farming_suitable": 1, "tank_size_liters": 500, "difficulty": "easy",
        "notes": "Often raised in decorative terrace ponds; edible.",
    },
    {
        "species": "Pangasius (Basa)", "water_type": "freshwater",
        "key_nutrients": "protein,omega3",
        "deficiencies_addressed": "iron_deficiency,vitamin_b12_deficiency",
        "protein_g": 22.0, "omega3_mg": 250, "iron_mg": 1.0, "zinc_mg": 0.8,
        "vitamin_b12_ug": 2.0, "vitamin_d_ug": 4.0, "iodine_ug": 7, "vitamin_a_ug": 8,
        "region": "Southeast Asia",
        "farming_suitable": 1, "tank_size_liters": 400, "difficulty": "easy",
        "notes": "Major aquaculture species in Vietnam; tolerant of dense stocking.",
    },
    {
        "species": "Atlantic Mackerel", "water_type": "marine",
        "key_nutrients": "omega3,vitamin_d,vitamin_b12,selenium",
        "deficiencies_addressed": "vitamin_d_deficiency,vitamin_b12_deficiency",
        "protein_g": 23.9, "omega3_mg": 1300, "iron_mg": 1.7, "zinc_mg": 1.1,
        "vitamin_b12_ug": 9.0, "vitamin_d_ug": 16.0, "iodine_ug": 29, "vitamin_a_ug": 30,
        "region": "North Atlantic",
        "farming_suitable": 0, "tank_size_liters": 0, "difficulty": "hard",
        "notes": "Sustainably caught; very high omega-3.",
    },
    {
        "species": "Indian Mackerel", "water_type": "marine",
        "key_nutrients": "omega3,vitamin_d,iodine,vitamin_b12",
        "deficiencies_addressed": "vitamin_d_deficiency,iron_deficiency,vitamin_b12_deficiency",
        "protein_g": 22.0, "omega3_mg": 1450, "iron_mg": 1.9, "zinc_mg": 1.2,
        "vitamin_b12_ug": 8.5, "vitamin_d_ug": 14.0, "iodine_ug": 35, "vitamin_a_ug": 28,
        "region": "Indian Ocean,Western Pacific",
        "farming_suitable": 0, "tank_size_liters": 0, "difficulty": "hard",
        "notes": "Affordable small pelagic - staple protein in South Asia.",
    },
    {
        "species": "Pearl Spot (Karimeen)", "water_type": "brackish",
        "key_nutrients": "protein,omega3,vitamin_a",
        "deficiencies_addressed": "vitamin_a_deficiency,iron_deficiency",
        "protein_g": 20.0, "omega3_mg": 500, "iron_mg": 1.4, "zinc_mg": 1.1,
        "vitamin_b12_ug": 2.0, "vitamin_d_ug": 7.0, "iodine_ug": 25, "vitamin_a_ug": 38,
        "region": "South Asia",
        "farming_suitable": 1, "tank_size_liters": 300, "difficulty": "medium",
        "notes": "Brackish-water delicacy; suitable for backwater terrace ponds.",
    },
    {
        "species": "Gourami", "water_type": "freshwater",
        "key_nutrients": "protein,vitamin_b12",
        "deficiencies_addressed": "vitamin_b12_deficiency,iron_deficiency",
        "protein_g": 18.5, "omega3_mg": 180, "iron_mg": 1.3, "zinc_mg": 0.9,
        "vitamin_b12_ug": 1.5, "vitamin_d_ug": 3.0, "iodine_ug": 6, "vitamin_a_ug": 10,
        "region": "Southeast Asia",
        "farming_suitable": 1, "tank_size_liters": 200, "difficulty": "easy",
        "notes": "Labyrinth fish - tolerates stagnant low-oxygen water.",
    },
    {
        "species": "Pompano", "water_type": "marine",
        "key_nutrients": "omega3,protein,vitamin_d",
        "deficiencies_addressed": "vitamin_d_deficiency,vitamin_b12_deficiency",
        "protein_g": 23.0, "omega3_mg": 700, "iron_mg": 1.0, "zinc_mg": 1.0,
        "vitamin_b12_ug": 2.5, "vitamin_d_ug": 12.0, "iodine_ug": 22, "vitamin_a_ug": 16,
        "region": "Tropical Atlantic,Pacific",
        "farming_suitable": 0, "tank_size_liters": 0, "difficulty": "hard",
        "notes": "Marine cage aquaculture candidate; premium quality.",
    },
    {
        "species": "Black Pomfret", "water_type": "marine",
        "key_nutrients": "protein,omega3,vitamin_b12",
        "deficiencies_addressed": "vitamin_b12_deficiency,iron_deficiency",
        "protein_g": 20.0, "omega3_mg": 800, "iron_mg": 1.3, "zinc_mg": 1.0,
        "vitamin_b12_ug": 2.5, "vitamin_d_ug": 10.0, "iodine_ug": 24, "vitamin_a_ug": 22,
        "region": "Indian Ocean,Western Pacific",
        "farming_suitable": 0, "tank_size_liters": 0, "difficulty": "hard",
        "notes": "Popular marine table fish; rich in omega-3.",
    },
]


def main():
    fieldnames = list(ROWS[0].keys())
    with OUT.open("w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(ROWS)
    print(f"[fish-db] wrote {len(ROWS)} species to {OUT}")


if __name__ == "__main__":
    main()
