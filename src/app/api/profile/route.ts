import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateDailyCalorieTarget } from "@/lib/nutrition";
import type { Profile } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
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

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Perfil não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Erro interno ao buscar perfil:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor. Tente novamente mais tarde." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Dados do perfil inválidos." }, { status: 400 });
    }
    const submittedFields = body as Record<string, unknown>;

    // Fetch current profile to merge with updates
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const allowedFields = [
      "name",
      "age",
      "gender",
      "height_cm",
      "weight_kg",
      "activity_level",
      "goal",
      "target_weight_kg",
      "available_equipment",
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (submittedFields[field] !== undefined) {
        updateData[field] = submittedFields[field];
      }
    }

    const mergedProfile = { ...currentProfile, ...updateData } as Profile;
    updateData.daily_calorie_target = calculateDailyCalorieTarget(mergedProfile);

    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .upsert({ id: user.id, email: user.email, ...updateData })
      .select()
      .single();

    if (updateError) {
      console.error("Erro ao atualizar perfil:", updateError);
      return NextResponse.json(
        { error: "Erro ao atualizar o perfil." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Perfil atualizado com sucesso.",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Erro interno ao atualizar perfil:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor. Tente novamente mais tarde." },
      { status: 500 }
    );
  }
}
