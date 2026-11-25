import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { workoutOptions } from "@/lib/workout-preferences";

const allowed = new Set<string>(workoutOptions.map(({ id }) => id));

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Entre na sua conta para salvar." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const equipment: unknown = body?.equipment;
  const excluded: unknown = body?.excluded;
  if (!Array.isArray(equipment) || equipment.length > allowed.size ||
    !equipment.every((item) => typeof item === "string" && allowed.has(item)) ||
    !Array.isArray(excluded) || excluded.length > 20 ||
    !excluded.every((item) => typeof item === "string" && item.trim().length <= 100)) {
    return NextResponse.json({ error: "Use até 20 exercícios a evitar, com até 100 caracteres por linha." }, { status: 400 });
  }

  const { error } = await supabase.from("profiles").update({
    available_equipment: [...new Set(equipment)],
    excluded_exercises: [...new Set(excluded.map((item: string) => item.trim()).filter(Boolean))],
  }).eq("id", user.id).select("id").single();

  if (error) return NextResponse.json({ error: "Não foi possível salvar as preferências." }, { status: 500 });
  return NextResponse.json({ saved: true });
}
