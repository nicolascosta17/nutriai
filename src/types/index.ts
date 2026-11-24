// ============================================================
// NutriAI – TypeScript type definitions
// ============================================================

// --------------------------------------------------
// Database row types
// --------------------------------------------------

export interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  weight_kg: number | null;
  height_cm: number | null;
  age: number | null;
  gender: "male" | "female" | "other" | null;
  activity_level:
    | "sedentary"
    | "light"
    | "moderate"
    | "active"
    | "very_active"
    | null;
  goal: "lose_weight" | "gain_muscle" | "maintain" | "health" | null;
  target_weight_kg: number | null;
  available_equipment: string[] | null;
  daily_calorie_target: number | null;
  created_at: string;
  updated_at: string;
}

export interface FoodEntry {
  id: string;
  user_id: string;
  photo_url: string | null;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack" | null;
  food_name: string | null;
  description: string | null;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  fiber_g: number | null;
  sugar_g: number | null;
  sodium_mg: number | null;
  ai_analysis: string | null;
  created_at: string;
}

export interface DietPlan {
  id: string;
  user_id: string;
  plan_name: string | null;
  daily_calories: number | null;
  meals: DietMeal[] | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
}

export interface DietMeal {
  name: string;
  time: string;
  foods: string[];
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface ExercisePlan {
  id: string;
  user_id: string;
  plan_name: string | null;
  goal: string | null;
  difficulty: "beginner" | "intermediate" | "advanced" | null;
  schedule: ExerciseSchedule | null;
  exercises: Exercise[] | null;
  is_active: boolean;
  created_at: string;
}

export interface ExerciseSchedule {
  [day: string]: ExerciseDetail[];
}

export interface ExerciseDetail {
  name: string;
  sets: number;
  reps: string;
  duration: string | null;
  instructions: string;
}

export interface Exercise {
  name: string;
  muscle_group: string;
  sets: number;
  reps: string;
  duration: string | null;
  instructions: string;
}

export interface WorkoutLog {
  id: string;
  user_id: string;
  exercise_plan_id: string | null;
  exercise_name: string | null;
  duration_min: number | null;
  calories_burned: number | null;
  notes: string | null;
  completed_at: string;
}

export interface WeightLog {
  id: string;
  user_id: string;
  weight_kg: number;
  logged_at: string;
}

// --------------------------------------------------
// API response types
// --------------------------------------------------

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

export interface FoodAnalysisResult {
  food_name: string;
  description: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg: number;
  ai_analysis: string;
}

export interface DietPlanResult {
  plan_name: string;
  daily_calories: number;
  meals: DietMeal[];
  notes: string;
}

export interface ExercisePlanResult {
  plan_name: string;
  goal: string;
  difficulty: string;
  schedule: ExerciseSchedule;
  exercises: Exercise[];
  notes: string;
}

// --------------------------------------------------
// Utility / input types
// --------------------------------------------------

export interface ProfileInput {
  name?: string;
  weight_kg?: number;
  height_cm?: number;
  age?: number;
  gender?: "male" | "female" | "other";
  activity_level?:
    | "sedentary"
    | "light"
    | "moderate"
    | "active"
    | "very_active";
  goal?: "lose_weight" | "gain_muscle" | "maintain" | "health";
  target_weight_kg?: number;
  available_equipment?: string[];
  daily_calorie_target?: number;
}

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface MacroTargets {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}
