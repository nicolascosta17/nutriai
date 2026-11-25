import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeFood } from "@/lib/gemini";

export const dynamic = "force-dynamic";

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

    const formData = await request.formData();
    const image = formData.get("image") || formData.get("photo");
    const mealType = formData.get("meal_type") || "lunch";

    if (!image || typeof image === "string" || image.size === 0) {
      return NextResponse.json(
        { error: "Imagem é obrigatória para a análise." },
        { status: 400 }
      );
    }

    if (typeof mealType !== "string" || !["breakfast", "lunch", "dinner", "snack"].includes(mealType)) {
      return NextResponse.json({ error: "Tipo de refeição inválido." }, { status: 400 });
    }

    // Convert image to base64
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const mimeType = image.type || "image/jpeg";

    // Analyze food with Gemini
    const analysis = await analyzeFood(base64, mimeType);

    const bucket = supabase.storage.from("food-photos");
    const storagePath = `${user.id}/${crypto.randomUUID()}`;
    const { error: uploadError } = await bucket.upload(storagePath, buffer, {
      contentType: mimeType,
      upsert: false,
    });
    if (uploadError) console.warn("Não foi possível armazenar a foto da refeição.", uploadError.name);

    // Insert food entry into database
    const { data: entry, error: insertError } = await supabase
      .from("food_entries")
      .insert({
        user_id: user.id,
        meal_type: mealType,
        food_name: analysis.food_name,
        description: analysis.description,
        calories: analysis.calories,
        protein_g: analysis.protein_g,
        carbs_g: analysis.carbs_g,
        fat_g: analysis.fat_g,
        fiber_g: analysis.fiber_g,
        sugar_g: analysis.sugar_g,
        sodium_mg: analysis.sodium_mg,
        photo_url: uploadError ? null : storagePath,
        ai_analysis: analysis.ai_analysis,
      })
      .select()
      .single();

    if (insertError) {
      if (!uploadError) await bucket.remove([storagePath]);
      console.error("Erro ao salvar entrada de alimento:", insertError);
      // Return analysis even if DB insert had issues
      return NextResponse.json({
        message: "Alimento analisado com sucesso.",
        analysis,
        entry: null,
      });
    }

    return NextResponse.json({
      message: "Alimento analisado e registrado com sucesso.",
      analysis,
      entry,
    });
  } catch (error) {
    console.error("Erro interno ao analisar alimento:", error);
    return NextResponse.json(
      { error: "Erro ao processar visão computacional nutricional. Tente novamente." },
      { status: 500 }
    );
  }
}
