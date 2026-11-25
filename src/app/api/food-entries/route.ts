import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "day";

    // Calculate date range
    const now = new Date();
    const dateParam = searchParams.get("date");
    const referenceDate = dateParam ? new Date(dateParam + "T00:00:00") : now;

    let startDate: Date;
    let endDate: Date;

    switch (range) {
      case "week": {
        startDate = new Date(referenceDate);
        startDate.setDate(startDate.getDate() - startDate.getDay());
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);
        break;
      }
      case "month": {
        startDate = new Date(
          referenceDate.getFullYear(),
          referenceDate.getMonth(),
          1
        );
        endDate = new Date(
          referenceDate.getFullYear(),
          referenceDate.getMonth() + 1,
          1
        );
        break;
      }
      case "day":
      default: {
        startDate = new Date(referenceDate);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(referenceDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      }
    }

    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    // Fetch food entries within date range
    const { data: entries, error: entriesError } = await supabase
      .from("food_entries")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", startISO)
      .lte("created_at", endISO)
      .order("created_at", { ascending: false });

    if (entriesError) {
      console.error("Erro ao buscar entradas de alimentos:", entriesError);
      return NextResponse.json(
        { error: "Erro ao buscar registros de alimentação." },
        { status: 500 }
      );
    }

    // Calculate aggregated totals
    const totals = (entries ?? []).reduce(
      (acc, entry) => ({
        calories: acc.calories + (entry.calories ?? 0),
        protein_g: acc.protein_g + (entry.protein_g ?? 0),
        carbs_g: acc.carbs_g + (entry.carbs_g ?? 0),
        fat_g: acc.fat_g + (entry.fat_g ?? 0),
      }),
      { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
    );

    return NextResponse.json({
      entries: entries ?? [],
      totals: {
        calories: Math.round(totals.calories),
        protein_g: Math.round(totals.protein_g * 10) / 10,
        carbs_g: Math.round(totals.carbs_g * 10) / 10,
        fat_g: Math.round(totals.fat_g * 10) / 10,
      },
      period: {
        start: startISO,
        end: endISO,
        range,
      },
    });
  } catch (error) {
    console.error("Erro interno ao buscar entradas de alimentos:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor. Tente novamente mais tarde." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id || !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(id)) {
    return NextResponse.json({ error: "Registro inválido." }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Entre na sua conta para remover a refeição." }, { status: 401 });
    }

    const { error } = await supabase.from("food_entries").delete().eq("id", id).eq("user_id", user.id);
    if (error) throw error;
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Não foi possível remover a refeição." }, { status: 500 });
  }
}
