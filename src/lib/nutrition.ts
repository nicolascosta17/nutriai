// ============================================================
// NutriAI – Nutrition utility functions
// ============================================================

import type { Profile, MacroTargets } from "@/types";

// --------------------------------------------------
// Activity multipliers (Mifflin-St Jeor)
// --------------------------------------------------

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

// --------------------------------------------------
// 1. BMR – Mifflin-St Jeor equation
// --------------------------------------------------

/**
 * Calculates Basal Metabolic Rate using the Mifflin-St Jeor equation.
 *
 * Male:   10 × weight(kg) + 6.25 × height(cm) − 5 × age − 161 + 166
 *         → simplified: 10w + 6.25h − 5a + 5
 * Female: 10 × weight(kg) + 6.25 × height(cm) − 5 × age − 161
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: string
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === "female" ? base - 161 : base + 5;
}

// --------------------------------------------------
// 2. TDEE
// --------------------------------------------------

/**
 * Total Daily Energy Expenditure = BMR × activity factor.
 */
export function calculateTDEE(bmr: number, activityLevel: string): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.2;
  return Math.round(bmr * multiplier);
}

// --------------------------------------------------
// 3. Macro targets based on goal
// --------------------------------------------------

/**
 * Returns daily macronutrient targets in grams based on TDEE and goal.
 *
 * | Goal          | Calories adj | Protein | Carbs | Fat   |
 * |---------------|-------------|---------|-------|-------|
 * | lose_weight   | −20 %       | 40 %    | 30 %  | 30 %  |
 * | gain_muscle   | +10 %       | 35 %    | 45 %  | 20 %  |
 * | maintain      |   0 %       | 30 %    | 45 %  | 25 %  |
 * | health        |   0 %       | 30 %    | 45 %  | 25 %  |
 */
export function calculateMacroTargets(
  tdee: number,
  goal: string
): MacroTargets {
  let calories: number;
  let proteinPct: number;
  let carbsPct: number;
  let fatPct: number;

  switch (goal) {
    case "lose_weight":
      calories = Math.round(tdee * 0.8);
      proteinPct = 0.4;
      carbsPct = 0.3;
      fatPct = 0.3;
      break;
    case "gain_muscle":
      calories = Math.round(tdee * 1.1);
      proteinPct = 0.35;
      carbsPct = 0.45;
      fatPct = 0.2;
      break;
    case "maintain":
    case "health":
    default:
      calories = tdee;
      proteinPct = 0.3;
      carbsPct = 0.45;
      fatPct = 0.25;
      break;
  }

  return {
    calories,
    protein_g: Math.round((calories * proteinPct) / 4), // 4 kcal/g
    carbs_g: Math.round((calories * carbsPct) / 4), // 4 kcal/g
    fat_g: Math.round((calories * fatPct) / 9), // 9 kcal/g
  };
}

// --------------------------------------------------
// 4. BMI
// --------------------------------------------------

/**
 * Body Mass Index = weight(kg) / (height(m))²
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
}

// --------------------------------------------------
// 5. Weight status (in Portuguese)
// --------------------------------------------------

export function getWeightStatus(bmi: number): string {
  if (bmi < 18.5) return "Abaixo do peso";
  if (bmi < 25) return "Peso normal";
  if (bmi < 30) return "Sobrepeso";
  if (bmi < 35) return "Obesidade grau I";
  if (bmi < 40) return "Obesidade grau II";
  return "Obesidade grau III";
}

// --------------------------------------------------
// 6. Daily calorie target from full profile
// --------------------------------------------------

/**
 * Calculates daily calorie target from a Profile object.
 * Falls back to sensible defaults when profile fields are missing.
 */
export function calculateDailyCalorieTarget(profile: Profile): number {
  const weight = profile.weight_kg ?? 70;
  const height = profile.height_cm ?? 170;
  const age = profile.age ?? 30;
  const gender = profile.gender ?? "male";
  const activityLevel = profile.activity_level ?? "moderate";
  const goal = profile.goal ?? "maintain";

  const bmr = calculateBMR(weight, height, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);
  const macros = calculateMacroTargets(tdee, goal);

  return macros.calories;
}
