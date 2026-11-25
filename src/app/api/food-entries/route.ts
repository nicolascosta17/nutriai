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

    const paths = (entries ?? []).flatMap((entry) =>
      typeof entry.photo_url === "string" && entry.photo_url.startsWith(user.id + "/") ? [entry.photo_url] : []
    );
    const { data: signed } = paths.length
      ? await supabase.storage.from("food-photos").createSignedUrls(paths, 3600)
      : { data: [] };
    const photos = new Map((signed ?? []).flatMap(({ path, signedUrl }) =>
      path && signedUrl ? [[path, signedUrl] as const] : []
    ));

    return NextResponse.json({
      entries: (entries ?? []).map((entry) => ({
        ...entry,
        photo_url: photos.get(entry.photo_url) ?? (typeof entry.photo_url === "string" && entry.photo_url.startsWith("https://") ? entry.photo_url : null),
      })),
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
    }, { headers: { "Cache-Control": "private, no-store" } });
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

    const { data: entry, error } = await supabase.from("food_entries").delete().eq("id", id).eq("user_id", user.id).select("photo_url").maybeSingle();
    if (error) throw error;
    if (typeof entry?.photo_url === "string" && entry.photo_url.startsWith(user.id + "/")) {
      await supabase.storage.from("food-photos").remove([entry.photo_url]);
    }
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Não foi possível remover a refeição." }, { status: 500 });
  }
}
