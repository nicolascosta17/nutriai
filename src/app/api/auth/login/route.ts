import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthErrorMessage, isSupabaseConfigured } from "@/lib/supabase/client";

function reply(body: { error: string } | { destination: string }, status: number) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  // A custom header requires a CORS preflight from other origins.
  if (request.headers.get("x-nutriai-request") !== "login") {
    return reply({ error: "Solicitação inválida." }, 403);
  }

  if (!isSupabaseConfigured()) {
    return reply({ error: "O serviço de login está indisponível." }, 503);
  }

  const credentials = await request.json().catch(() => null);
  const email = typeof credentials?.email === "string" ? credentials.email.trim() : "";
  const password = credentials?.password;
  if (!email || typeof password !== "string" || !password) {
    return reply({ error: "Preencha seu e-mail e senha." }, 400);
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session || !data.user) {
      return reply({ error: getAuthErrorMessage(error, "login") }, error?.status === 429 ? 429 : 401);
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("daily_calorie_target")
      .eq("id", data.user.id)
      .maybeSingle();

    return reply({ destination: profileError || profile?.daily_calorie_target ? "/dashboard" : "/onboarding" }, 200);
  } catch (error) {
    return reply({ error: getAuthErrorMessage(error, "login") }, 503);
  }
}
