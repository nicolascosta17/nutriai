import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateDietPlan } from "@/lib/gemini";
import { calculateDailyCalorieTarget } from "@/lib/nutrition";
import type { Profile } from "@/types";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Não autorizado. Faça login para continuar." },
        { status: 401 }
      );
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Perfil clínico não encontrado. Preencha seus dados de peso e altura primeiro." },
        { status: 404 }
      );
    }

    // Calculate daily calorie target
    const dailyCalorieTarget = calculateDailyCalorieTarget(profile as Profile);

    // Generate diet plan with Gemini
    const dietPlan = await generateDietPlan(profile as Profile);

    // Deactivate previous diet plans
    await supabase
      .from("diet_plans")
      .update({ is_active: false })
      .eq("user_id", user.id)
      .eq("is_active", true);

    // Insert new plan
    const { data: savedPlan, error: insertError } = await supabase
      .from("diet_plans")
      .insert({
        user_id: user.id,
        plan_name: dietPlan.plan_name,
        daily_calories: dailyCalorieTarget || dietPlan.daily_calories,
        meals: dietPlan.meals,
        notes: dietPlan.notes,
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Erro ao salvar plano de dieta:", insertError);
      return NextResponse.json(
        { error: "Erro ao salvar a prescrição dietética." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Plano nutricional estruturado com sucesso.",
      plan: savedPlan,
    });
  } catch (error) {
    console.error("Erro interno ao gerar dieta:", error);
    return NextResponse.json(
      { error: "Não foi possível gerar a prescrição dietética com IA no momento." },
      { status: 500 }
    );
  }
}
