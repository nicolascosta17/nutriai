import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { summarizeProgress } from "@/lib/luna-progress";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store" };

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Entre na sua conta para analisar sua evolução." }, { status: 401, headers });

    const now = new Date();
    const since = new Date(now.getTime() - 30 * 86400000).toISOString();
    const [weights, meals] = await Promise.all([
      supabase.from("weight_logs").select("weight_kg, logged_at")
        .eq("user_id", user.id).gte("logged_at", since).lte("logged_at", now.toISOString()),
      supabase.from("food_entries").select("created_at")
        .eq("user_id", user.id).gte("created_at", since).lte("created_at", now.toISOString()),
    ]);
    if (weights.error || meals.error) throw new Error("Não foi possível ler os registros.");

    return NextResponse.json({ progress: summarizeProgress(weights.data ?? [], meals.data ?? []) }, { headers });
  } catch {
    return NextResponse.json({ error: "Não foi possível analisar sua evolução agora. Tente novamente." }, { status: 503, headers });
  }
}
