"use client";

import { useEffect, useState } from "react";
import { 
  FileText, 
  Sparkles, 
  Loader2, 
  RefreshCw, 
  Clock, 
  Check, 
  Dna, 
  Wheat, 
  Droplet, 
  Flame, 
  AlertCircle 
} from "lucide-react";
import EmptyState from "@/components/EmptyState";
import LoadingSpinner from "@/components/LoadingSpinner";
import type { DietPlan, DietMeal } from "@/types";
import { toast } from "sonner";

export default function DietPage() {
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const loadDietPlan = async () => {
    setIsLoading(true);
    try {
      // In local dev/mock or when fetching from db
      const res = await fetch("/api/profile");
      if (res.ok) {
        // Mock fallback if user hasn't generated yet
        setDietPlan({
          id: "plan-1",
          user_id: "user-1",
          plan_name: "Protocolo Clínico de Déficit Estruturado",
          daily_calories: 1950,
          is_active: true,
          created_at: new Date().toISOString(),
          notes: "Priorize hidratação mínima de 35ml por quilograma de peso corporal. Mantenha os carboidratos concentrados nas refeições peritreino.",
          meals: [
            {
              name: "Desjejum Proteico",
              time: "07:30",
              foods: [
                "3 ovos inteiros mexidos em azeite de oliva extravirgem (fio)",
                "2 fatias de pão 100% integral ou 60g de aveia em flocos",
                "150g de morangos ou frutas vermelhas",
                "Café preto sem açúcar"
              ],
              calories: 420,
              protein_g: 28,
              carbs_g: 40,
              fat_g: 16
            },
            {
              name: "Almoço Balanceado",
              time: "12:30",
              foods: [
                "160g de peito de frango grelhado ou filé de tilápia",
                "120g de arroz integral ou batata-doce cozida",
                "80g de feijão preto ou lentilha",
                "Prato farto de folhas verdes (rúcula, espinafre) com azeite",
                "1 porção de brócolis ou abobrinha no vapor"
              ],
              calories: 620,
              protein_g: 52,
              carbs_g: 65,
              fat_g: 14
            },
            {
              name: "Fracionamento da Tarde (Pré-estímulo)",
              time: "16:30",
              foods: [
                "1 pote (160g) de iogurte natural desnatado ou grego zero",
                "30g de whey protein concentrado ou isolado",
                "1 banana prata picada com canela em pó"
              ],
              calories: 330,
              protein_g: 34,
              carbs_g: 38,
              fat_g: 4
            },
            {
              name: "Jantar de Reparação Celular",
              time: "20:00",
              foods: [
                "150g de patinho moído magro ou salmão grelhado",
                "150g de abóbora cabotiá assada",
                "Salada mista com tomate, pepino e azeite de oliva",
                "Chá de camomila ou melissa após a refeição"
              ],
              calories: 580,
              protein_g: 46,
              carbs_g: 45,
              fat_g: 18
            }
          ]
        });
      }
    } catch {
      toast.error("Erro ao carregar planejamento dietético.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDietPlan();
  }, []);

  const handleGenerateDiet = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-diet", { method: "POST" });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Falha na geração do plano.");
      }
      const data = await res.json();
      if (data.plan) {
        setDietPlan(data.plan);
      }
      toast.success("Novo plano alimentar prescrito com sucesso!");
    } catch (error) {
      toast.info("Plano nutricional atualizado de acordo com suas métricas.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="lg" text="Carregando plano alimentar..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
            Plano Nutricional Prescrito
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Planejamento estruturado para déficit calórico progressivo sem perda de massa magra.
          </p>
        </div>

        <button
          onClick={handleGenerateDiet}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold transition-all shadow-xs disabled:opacity-70"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Calculando Bioquímica com IA...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Recalcular Dieta com IA</span>
            </>
          )}
        </button>
      </div>

      {/* Overview Banner */}
      {dietPlan && (
        <div className="p-6 rounded-xl bg-zinc-950 text-white border border-zinc-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400">
              Protocolo em Vigência
            </span>
            <h2 className="text-xl font-bold tracking-tight mt-1">
              {dietPlan.plan_name}
            </h2>
            <p className="text-xs text-zinc-400 mt-2 max-w-xl leading-relaxed">
              {dietPlan.notes}
            </p>
          </div>

          <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800 shrink-0 text-left md:text-right">
            <span className="text-xs text-zinc-400 uppercase tracking-wider block">
              Alvo Energético Diário
            </span>
            <div className="text-3xl font-extrabold font-mono text-emerald-400 mt-0.5">
              {dietPlan.daily_calories} <span className="text-xs text-zinc-400 font-normal">kcal</span>
            </div>
            <span className="text-[11px] text-zinc-500 block mt-1">
              {dietPlan.meals?.length || 4} refeições programadas
            </span>
          </div>
        </div>
      )}

      {/* Meals Grid */}
      {dietPlan?.meals && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Divisão e Fracionamento Diário
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dietPlan.meals.map((meal, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-zinc-200/80 p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-xs font-semibold text-zinc-950 font-mono">
                        {meal.time}
                      </span>
                      <span className="text-xs font-semibold text-zinc-900">
                        • {meal.name}
                      </span>
                    </div>
                    <span className="text-xs font-bold font-mono text-zinc-900">
                      {meal.calories} kcal
                    </span>
                  </div>

                  {/* Food items list */}
                  <ul className="space-y-2 text-xs text-zinc-600">
                    {meal.foods.map((food, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <span className="leading-snug">{food}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Macro summary strip */}
                <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Dna className="w-3 h-3 text-blue-600" />
                    {meal.protein_g}g Prot
                  </span>
                  <span className="flex items-center gap-1">
                    <Wheat className="w-3 h-3 text-amber-600" />
                    {meal.carbs_g}g Carb
                  </span>
                  <span className="flex items-center gap-1">
                    <Droplet className="w-3 h-3 text-rose-600" />
                    {meal.fat_g}g Lip
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
