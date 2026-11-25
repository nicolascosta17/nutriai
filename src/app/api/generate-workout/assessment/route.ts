import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseTrainingAnswers } from "@/lib/training-assessment";

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Entre na sua conta para salvar as respostas." }, { status: 401 });

    const answers = parseTrainingAnswers(await request.json().catch(() => null));
    if (!answers) return NextResponse.json({ error: "Escolha os dias e responda todas as perguntas." }, { status: 400 });

    const trainingAssessment = { ...answers, revision: crypto.randomUUID() };
    const { error } = await supabase.from("profiles").update({ training_assessment: trainingAssessment })
      .eq("id", user.id).select("id").single();
    if (error) throw error;

    return NextResponse.json({ answers, saved: true });
  } catch {
    return NextResponse.json({ error: "Não foi possível salvar o questionário. Tente novamente." }, { status: 503 });
  }
}
