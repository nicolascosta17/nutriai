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
    const image = (formData.get("image") || formData.get("photo")) as File | null;
    const mealType = (formData.get("meal_type") as string) || "lunch";

    if (!image) {
      return NextResponse.json(
        { error: "Imagem é obrigatória para a análise." },
        { status: 400 }
      );
    }

    // Convert image to base64
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const mimeType = image.type || "image/jpeg";

    // Analyze food with Gemini
    const analysis = await analyzeFood(base64, mimeType);

    // Upload to Supabase Storage (if storage bucket configured)
    let photoUrl: string | null = null;
    try {
      const timestamp = Date.now();
      const sanitizedFilename = (image.name || "meal.jpg").replace(/[^a-zA-Z0-9._-]/g, "_");
      const storagePath = `${user.id}/${timestamp}-${sanitizedFilename}`;

      const { error: uploadError } = await supabase.storage
        .from("food-photos")
        .upload(storagePath, buffer, {
          contentType: mimeType,
          upsert: false,
        });

      if (!uploadError) {
        const { data } = supabase.storage.from("food-photos").getPublicUrl(storagePath);
        photoUrl = data.publicUrl;
      }
    } catch (storageErr) {
      console.warn("Storage upload bypassed:", storageErr);
    }

    // If no public storage url, store a lightweight thumbnail or placeholder
    if (!photoUrl) {
      photoUrl = `data:${mimeType};base64,${base64.slice(0, 500)}...`;
    }

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
        photo_url: photoUrl,
        ai_analysis: analysis.ai_analysis,
      })
      .select()
      .single();

    if (insertError) {
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
