import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function authorizedClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function GET() {
  try {
    const { supabase, user } = await authorizedClient();
    if (!user) return NextResponse.json({ error: "Entre na sua conta para ver seu histórico." }, { status: 401 });

    const { data, error } = await supabase.from("weight_logs").select("*")
      .eq("user_id", user.id).order("logged_at", { ascending: false }).limit(100);
    if (error) throw error;
    return NextResponse.json({ history: [...data].reverse() });
  } catch {
    return NextResponse.json({ error: "Não foi possível carregar seu histórico de peso." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await authorizedClient();
    if (!user) return NextResponse.json({ error: "Entre na sua conta para registrar seu peso." }, { status: 401 });

    const body = await request.json().catch(() => null);
    const weight = body?.weight_kg;
    if (typeof weight !== "number" || !Number.isFinite(weight) || weight <= 0) {
      return NextResponse.json({ error: "Informe um peso válido." }, { status: 400 });
    }

    const { data, error } = await supabase.from("weight_logs").insert({
      user_id: user.id,
      weight_kg: weight,
    }).select().single();
    if (error) throw error;
    return NextResponse.json({ log: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Não foi possível registrar seu peso." }, { status: 500 });
  }
}
