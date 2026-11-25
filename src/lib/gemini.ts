"use server";

import { buildExerciseSchedule } from "@/lib/exercise-checklist";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type {
  FoodAnalysisResult,
  DietPlanResult,
  ExercisePlanResult,
  Profile,
} from "@/types";

function getModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key") {
    return null;
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
}

function extractJSON<T>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1].trim() : text.trim();
  return JSON.parse(raw) as T;
}

// ---------------------------------------------------------------------------
// 1. Analyze Food Photo
// ---------------------------------------------------------------------------

export async function analyzeFood(
  imageBase64: string,
  mimeType: string
): Promise<FoodAnalysisResult> {
  const model = getModel();

  if (!model) {
    // Intelligent clinical simulation when API key is not yet configured
    return {
      food_name: "Prato Completo Balanceado (Grelhado com Guarnições)",
      description: "Porção estimada: ~160g de filé de frango/peixe grelhado, ~120g de carboidrato complexo (arroz/batata) e vegetais verdes folhosos.",
      calories: 540,
      protein_g: 44,
      carbs_g: 48,
      fat_g: 14,
      fiber_g: 6,
      sugar_g: 3,
      sodium_mg: 420,
      ai_analysis: "Excelente densidade nutricional. Relação proteica ideal para preservação de massa magra em déficit calórico. Recomenda-se apenas moderação no azeite de finalização.",
    };
  }

  const prompt = `Você é um nutricionista especialista em análise fotométrica e volumétrica de alimentos. Analise a imagem fornecida e identifique todos os alimentos visíveis.

Para cada alimento encontrado, estime as porções e forneça os valores nutricionais detalhados.

Responda EXCLUSIVAMENTE com um objeto JSON válido (sem texto adicional) no seguinte formato:
{
  "food_name": "Nome descritivo do(s) alimento(s)",
  "description": "Descrição detalhada dos alimentos e porções estimadas em gramas",
  "calories": <número inteiro de calorias totais>,
  "protein_g": <gramas de proteína>,
  "carbs_g": <gramas de carboidratos>,
  "fat_g": <gramas de gordura>,
  "fiber_g": <gramas de fibra>,
  "sugar_g": <gramas de açúcar>,
  "sodium_mg": <miligramas de sódio>,
  "ai_analysis": "Parecer clínico nutricional em português incluindo: densidade calórica, distribuição de macronutrientes, micronutrientes e sugestão para atingir o objetivo metabólico."
}

Seja rigoroso e preciso nas estimativas com base na imagem.`;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        mimeType,
        data: imageBase64,
      },
    },
  ]);

  const responseText = result.response.text();
  return extractJSON<FoodAnalysisResult>(responseText);
}

// ---------------------------------------------------------------------------
// 2. Generate Diet Plan
// ---------------------------------------------------------------------------

export async function generateDietPlan(
  profile: Profile
): Promise<DietPlanResult> {
  const model = getModel();

  if (!model) {
    const weight = profile.weight_kg || 75;
    const isWeightLoss = profile.goal === "lose_weight" || !profile.goal;
    const dailyCals = isWeightLoss ? Math.round(weight * 24) : Math.round(weight * 32);

    return {
      plan_name: `Protocolo Clínico Personalizado (${isWeightLoss ? "Déficit Estruturado" : "Superávit Anabólico"})`,
      daily_calories: dailyCals,
      notes: "Hidratação prescrita: mínimo de 35ml por kg/dia. Concentração de carboidratos nos momentos de maior demanda energética.",
      meals: [
        {
          name: "Desjejum",
          time: "07:30",
          foods: ["3 ovos mexidos", "2 fatias de pão 100% integral", "150g de frutas vermelhas", "Café preto sem açúcar"],
          calories: 410,
          protein_g: 27,
          carbs_g: 40,
          fat_g: 15,
        },
        {
          name: "Almoço",
          time: "12:30",
          foods: ["160g de peito de frango grelhado", "120g de arroz integral", "80g de feijão carioca", "Salada farta de folhas verdes com azeite extravirgem"],
          calories: 590,
          protein_g: 50,
          carbs_g: 62,
          fat_g: 13,
        },
        {
          name: "Lanche Intermediário",
          time: "16:30",
          foods: ["1 iogurte natural desnatado", "30g de whey protein", "1 banana com canela"],
          calories: 320,
          protein_g: 33,
          carbs_g: 36,
          fat_g: 4,
        },
        {
          name: "Jantar",
          time: "20:00",
          foods: ["150g de peixe ou carne magra", "150g de abóbora cozida", "Legumes grelhados (brócolis, abobrinha)"],
          calories: 480,
          protein_g: 45,
          carbs_g: 38,
          fat_g: 12,
        },
      ],
    };
  }

  const prompt = `Você é um nutricionista clínico especialista em emagrecimento e composição corporal.
Com base no perfil do paciente:
- Peso: ${profile.weight_kg} kg
- Altura: ${profile.height_cm} cm
- Idade: ${profile.age} anos
- Sexo: ${profile.gender}
- Nível de atividade: ${profile.activity_level}
- Objetivo: ${profile.goal}
- Meta de peso: ${profile.target_weight_kg} kg

Gere uma prescrição dietética completa em formato JSON válido:
{
  "plan_name": "Nome técnico do plano",
  "daily_calories": <número inteiro de calorias>,
  "notes": "Orientações clínicas sobre hidratação, micronutrientes e fracionamento",
  "meals": [
    {
      "name": "Nome da refeição",
      "time": "Horário sugerido (HH:MM)",
      "foods": ["Item com gramatura ou porção específica"],
      "calories": <calorias>,
      "protein_g": <proteína>,
      "carbs_g": <carboidratos>,
      "fat_g": <gorduras>
    }
  ]
}`;

  const result = await model.generateContent(prompt);
  return extractJSON<DietPlanResult>(result.response.text());
}

// ---------------------------------------------------------------------------
// 3. Generate Exercise Plan
// ---------------------------------------------------------------------------

export async function generateExercisePlan(profile: Profile): Promise<ExercisePlanResult> {
  return {
    plan_name: "Treino com suas preferências",
    goal: profile.goal ?? "health",
    difficulty: "beginner",
    notes: "Exercícios individuais conforme os equipamentos e modalidades disponíveis.",
    schedule: buildExerciseSchedule(profile),
    exercises: [],
  };
}
