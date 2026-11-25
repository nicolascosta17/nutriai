"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Camera,
  Sunrise,
  Sun,
  Sunset,
  Coffee,
  Loader2,
  UploadCloud,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Scale,
  Flame,
  Dna,
  Wheat,
  Droplet
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

interface AnalysisResult {
  food_name: string;
  description?: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number;
  sugar_g?: number;
  sodium_mg?: number;
  meal_type?: MealType;
  ai_analysis?: string;
}

interface FoodPhotoUploadProps {
  onAnalysisComplete?: (result: AnalysisResult) => void;
}

const mealOptions: {
  value: MealType;
  label: string;
  sub: string;
  icon: React.ElementType;
}[] = [
    {
      value: "breakfast",
      label: "Desjejum",
      sub: "06:00 - 10:00",
      icon: Sunrise,
    },
    {
      value: "lunch",
      label: "Almoço",
      sub: "11:30 - 14:30",
      icon: Sun,
    },
    {
      value: "dinner",
      label: "Jantar",
      sub: "18:30 - 21:30",
      icon: Sunset,
    },
    {
      value: "snack",
      label: "Lanche Intermediário",
      sub: "Fracionamento",
      icon: Coffee,
    },
  ];

export default function FoodPhotoUpload({ onAnalysisComplete }: FoodPhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<MealType>("lunch");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const accepted = acceptedFiles[0];
    if (!accepted) return;
    setFile(accepted);
    setResult(null);
    const objectUrl = URL.createObjectURL(accepted);
    setPreview(objectUrl);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleAnalyze = async () => {
    if (!file) {
      toast.error("Anexe uma fotografia da refeição para iniciar a análise espectral.");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("meal_type", selectedMeal);

      const response = await fetch("/api/analyze-food", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => null);
        throw new Error(errJson?.error || "Falha na análise computacional do alimento.");
      }

      const resData = await response.json();
      const parsedAnalysis: AnalysisResult = resData.analysis || resData;
      setResult(parsedAnalysis);
      if (resData.entry) {
        toast.success("Refeição analisada e registrada.");
        onAnalysisComplete?.(parsedAnalysis);
      } else {
        toast.error("A análise foi concluída, mas a refeição não pôde ser registrada.");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao analisar imagem. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200/90 shadow-sm overflow-hidden">
      {/* Header bar */}
      <div className="border-b border-zinc-100 bg-zinc-50/50 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 tracking-tight flex items-center gap-2">
            <Camera className="w-4 h-4 text-emerald-600" />
            Visão Computacional Nutricional
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Estimativa fotométrica de densidade calórica e distribuição de macronutrientes
          </p>
        </div>
        {preview && !isLoading && (
          <button
            type="button"
            onClick={resetUpload}
            className="text-xs text-zinc-500 hover:text-zinc-800 flex items-center gap-1 font-medium"
          >
            <RefreshCw className="w-3 h-3" />
            Nova Captura
          </button>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Meal Category Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2.5">
            Momento da Refeição
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {mealOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedMeal === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedMeal(option.value)}
                  className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all ${isSelected
                      ? "border-zinc-950 bg-zinc-900 text-white shadow-sm"
                      : "border-zinc-200 bg-white hover:border-zinc-300 text-zinc-800"
                    }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-emerald-400" : "text-zinc-400"}`} />
                    <span className="text-xs font-medium">{option.label}</span>
                  </div>
                  <span className={`text-[10px] ${isSelected ? "text-zinc-400" : "text-zinc-500"}`}>
                    {option.sub}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Upload Dropzone / Preview */}
        {!preview ? (
          <div
            {...getRootProps()}
            className={`border border-dashed rounded-xl p-8 sm:p-10 text-center cursor-pointer transition-all ${isDragActive
                ? "border-emerald-600 bg-emerald-50/30"
                : "border-zinc-300 bg-zinc-50/60 hover:bg-zinc-50 hover:border-zinc-400"
              }`}
          >
            <input {...getInputProps()} />
            <div className="w-12 h-12 rounded-full bg-white border border-zinc-200 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <UploadCloud className="w-6 h-6 text-zinc-600" />
            </div>
            <p className="text-sm font-semibold text-zinc-900">
              Arraste a fotografia do prato ou selecione o arquivo
            </p>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              Formatos aceitos: JPG, PNG ou WebP. Posicione a câmera a 45° com iluminação uniforme para maior acurácia volumétrica.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative w-full h-64 sm:h-72 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-950">
              <Image
                src={preview}
                alt="Fotografia do prato selecionado"
                fill
                className="object-contain"
              />
              <div className="absolute bottom-3 left-3 bg-zinc-950/80 backdrop-blur-md px-3 py-1 rounded text-xs text-zinc-200 font-mono border border-zinc-700/50">
                {file?.name} ({(file?.size ? file.size / (1024 * 1024) : 0).toFixed(2)} MB)
              </div>
            </div>

            {!result && (
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-sm transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Processando visão computacional e decomposição de macros...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Calcular Calorias e Macronutrientes</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Nutritional Breakdown Results */}
        {result && (
          <div className="mt-6 pt-6 border-t border-zinc-200/80 animate-fade-in space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80 mb-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Alimento Identificado
                </span>
                <h3 className="text-base font-bold text-zinc-950 tracking-tight">
                  {result.food_name}
                </h3>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-2xl font-bold font-mono tracking-tight text-zinc-950">
                  {result.calories}
                </span>
                <span className="text-xs text-zinc-500 font-medium ml-1">kcal estimadas</span>
              </div>
            </div>

            {result.description && (
              <p className="text-xs text-zinc-600 leading-relaxed bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                {result.description}
              </p>
            )}

            {/* Macro Matrix Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border border-zinc-200/80 bg-white">
                <div className="flex items-center justify-between text-zinc-500 mb-1">
                  <span className="text-[11px] font-medium uppercase tracking-wider">Proteínas</span>
                  <Dna className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="text-lg font-bold font-mono text-zinc-900">
                  {result.protein_g} <span className="text-xs font-normal text-zinc-500">g</span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-zinc-200/80 bg-white">
                <div className="flex items-center justify-between text-zinc-500 mb-1">
                  <span className="text-[11px] font-medium uppercase tracking-wider">Carboidratos</span>
                  <Wheat className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <div className="text-lg font-bold font-mono text-zinc-900">
                  {result.carbs_g} <span className="text-xs font-normal text-zinc-500">g</span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-zinc-200/80 bg-white">
                <div className="flex items-center justify-between text-zinc-500 mb-1">
                  <span className="text-[11px] font-medium uppercase tracking-wider">Lipídios</span>
                  <Droplet className="w-3.5 h-3.5 text-rose-600" />
                </div>
                <div className="text-lg font-bold font-mono text-zinc-900">
                  {result.fat_g} <span className="text-xs font-normal text-zinc-500">g</span>
                </div>
              </div>
            </div>

            {/* Clinical AI Feedback */}
            {result.ai_analysis && (
              <div className="p-4 rounded-lg bg-zinc-900 text-zinc-100 text-xs leading-relaxed space-y-1.5 border border-zinc-800">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold uppercase tracking-wider text-[10px]">
                  <Sparkles className="w-3.5 h-3.5" />
                  Parecer Metabólico & Nutricional
                </div>
                <p className="text-zinc-300 font-sans">{result.ai_analysis}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
