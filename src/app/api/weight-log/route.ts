import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    const { data: weightLogs, error: logsError } = await supabase
      .from("weight_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("logged_at", { ascending: false });

    if (logsError) {
      console.error("Erro ao buscar histórico de peso:", logsError);
      return NextResponse.json(
        { error: "Erro ao buscar histórico de peso." },
        { status: 500 }
      );
    }

    return NextResponse.json({ weight_logs: weightLogs ?? [] });
  } catch (error) {
    console.error("Erro interno ao buscar histórico de peso:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor. Tente novamente mais tarde." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { weight_kg } = body;

    if (!weight_kg || typeof weight_kg !== "number" || weight_kg <= 0) {
      return NextResponse.json(
        { error: "Peso inválido. Informe um valor numérico positivo em kg." },
        { status: 400 }
      );
    }

    // Insert weight log
    const { data: weightLog, error: insertError } = await supabase
      .from("weight_logs")
      .insert({
        user_id: user.id,
        weight_kg,
        logged_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("Erro ao registrar peso:", insertError);
      return NextResponse.json(
        { error: "Erro ao registrar o peso." },
        { status: 500 }
      );
    }

    // Also update profile weight_kg
    const { error: profileUpdateError } = await supabase
      .from("profiles")
      .update({
        weight_kg,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (profileUpdateError) {
      console.error(
        "Erro ao atualizar peso no perfil:",
        profileUpdateError
      );
      // Non-blocking: weight log was saved, profile update is secondary
    }

    return NextResponse.json({
      message: "Peso registrado com sucesso.",
      weight_log: weightLog,
    });
  } catch (error) {
    console.error("Erro interno ao registrar peso:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor. Tente novamente mais tarde." },
      { status: 500 }
    );
  }
}
