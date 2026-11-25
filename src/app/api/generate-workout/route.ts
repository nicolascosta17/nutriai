import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateExercisePlan } from "@/lib/gemini";
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
        { error: "Perfil não encontrado. Complete seus dados físicos e modalidades primeiro." },
        { status: 404 }
      );
    }

    // Generate exercise plan with Gemini based on available equipment & goal
    const exercisePlan = await generateExercisePlan(profile as Profile);

    // Deactivate previous exercise plans
    await supabase
      .from("exercise_plans")
      .update({ is_active: false })
      .eq("user_id", user.id)
      .eq("is_active", true);

    // Insert new plan
    const { data: savedPlan, error: insertError } = await supabase
      .from("exercise_plans")
      .insert({
        user_id: user.id,
        plan_name: exercisePlan.plan_name,
        goal: profile.goal || "lose_weight",
        difficulty: exercisePlan.difficulty || "intermediate",
        schedule: exercisePlan.schedule,
        exercises: exercisePlan.exercises || [],
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Erro ao salvar plano de treino:", insertError);
      return NextResponse.json(
        { error: "Erro ao persistir a periodização de treino." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Periodização de treino gerada com sucesso.",
      plan: savedPlan,
    });
  } catch (error) {
    console.error("Erro interno ao gerar treino:", error);
    return NextResponse.json(
      { error: "Falha ao gerar o planejamento de treinos adaptado." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Entre na sua conta para consultar o plano de treino." }, { status: 401 });
    }

    const { data: plan, error } = await supabase.from("exercise_plans")
      .select("*").eq("user_id", user.id).eq("is_active", true)
      .order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (error) throw error;
    return NextResponse.json({ plan });
  } catch {
    return NextResponse.json({ error: "Não foi possível carregar o plano de treino." }, { status: 500 });
  }
}
