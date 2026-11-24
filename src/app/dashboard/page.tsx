"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Activity, 
  Camera, 
  Flame, 
  Dna, 
  Wheat, 
  Droplet, 
  ArrowRight, 
  Dumbbell, 
  Calendar, 
  TrendingDown, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import DailyProgress from "@/components/DailyProgress";
import NutritionCard from "@/components/NutritionCard";
import MealCard from "@/components/MealCard";
import MacroChart from "@/components/MacroChart";
import LoadingSpinner from "@/components/LoadingSpinner";
import type { FoodEntry, Profile } from "@/types";

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Daily Totals
  const [totals, setTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  useEffect(() => {
    async function loadDashboardData() {
      try {
        // Fetch profile
        const profileRes = await fetch("/api/profile");
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData.profile);
        }

        // Fetch today's food entries
        const foodRes = await fetch("/api/food-entries?range=day");
        if (foodRes.ok) {
          const foodData = await foodRes.json();
          const entries: FoodEntry[] = foodData.entries || [];
          setFoodEntries(entries);

          // Calculate totals
          const cals = entries.reduce((acc, curr) => acc + (curr.calories || 0), 0);
          const prot = entries.reduce((acc, curr) => acc + (Number(curr.protein_g) || 0), 0);
          const carb = entries.reduce((acc, curr) => acc + (Number(curr.carbs_g) || 0), 0);
          const fat = entries.reduce((acc, curr) => acc + (Number(curr.fat_g) || 0), 0);

          setTotals({
            calories: cals,
            protein: Math.round(prot),
            carbs: Math.round(carb),
            fat: Math.round(fat),
          });
        }
      } catch (err) {
        console.error("Erro ao carregar dados do painel:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const calorieTarget = profile?.daily_calorie_target || 2000;
  const proteinTarget = profile ? Math.round((profile.weight_kg || 75) * 2) : 150;
  const fatTarget = profile ? Math.round((profile.weight_kg || 75) * 0.8) : 60;
  const carbsTarget = Math.round((calorieTarget - (proteinTarget * 4 + fatTarget * 9)) / 4) || 200;

  const todayFormatted = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  if (isLoading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Carregando parâmetros metabólicos..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{capitalize(todayFormatted)}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
            Painel Metabólico Diário
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Meta ativa: <span className="font-semibold text-zinc-800">Déficit calórico de alta precisão</span> • Peso atual: <span className="font-mono text-zinc-800">{profile?.weight_kg || 78} kg</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/food"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold transition-all shadow-xs"
          >
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>Fotografar Refeição</span>
          </Link>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <NutritionCard
          icon={Flame}
          label="Ingestão Calórica"
          value={totals.calories}
          target={calorieTarget}
          unit=" kcal"
          color="bg-emerald-500"
        />
        <NutritionCard
          icon={Dna}
          label="Proteínas"
          value={totals.protein}
          target={proteinTarget}
          unit="g"
          color="bg-blue-500"
        />
        <NutritionCard
          icon={Wheat}
          label="Carboidratos"
          value={totals.carbs}
          target={carbsTarget}
          unit="g"
          color="bg-amber-500"
        />
        <NutritionCard
          icon={Droplet}
          label="Lipídios"
          value={totals.fat}
          target={fatTarget}
          unit="g"
          color="bg-rose-500"
        />
      </div>

      {/* Main Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Daily Balancer & Macro Ring */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-zinc-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100">
              <div>
                <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
                  Balanço Energético & Distribuição
                </h3>
                <p className="text-xs text-zinc-500">
                  Acompanhamento em tempo real vs. prescrição
                </p>
              </div>
              <span className="text-xs font-mono font-medium px-2.5 py-1 rounded bg-zinc-100 text-zinc-700">
                Saldo: {calorieTarget - totals.calories} kcal restantes
              </span>
            </div>

            <DailyProgress
              calories={{ current: totals.calories, target: calorieTarget }}
              protein={{ current: totals.protein, target: proteinTarget }}
              carbs={{ current: totals.carbs, target: carbsTarget }}
              fat={{ current: totals.fat, target: fatTarget }}
            />
          </div>

          {/* Historical 7-day Trend */}
          <div className="bg-white rounded-xl border border-zinc-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
                  Consistência nos Últimos 7 Dias
                </h3>
                <p className="text-xs text-zinc-500">
                  Evolução do balanço energético e déficit acumulado
                </p>
              </div>
            </div>
            <MacroChart
              data={[
                { date: "Seg", calories: 1850, protein: 140, carbs: 180, fat: 55 },
                { date: "Ter", calories: 1920, protein: 155, carbs: 190, fat: 58 },
                { date: "Qua", calories: 1780, protein: 148, carbs: 165, fat: 50 },
                { date: "Qui", calories: 2010, protein: 160, carbs: 210, fat: 62 },
                { date: "Sex", calories: 1890, protein: 150, carbs: 185, fat: 56 },
                { date: "Sáb", calories: 2100, protein: 145, carbs: 230, fat: 65 },
                { date: "Hoje", calories: totals.calories || 1650, protein: totals.protein || 135, carbs: totals.carbs || 160, fat: totals.fat || 48 },
              ]}
            />
          </div>
        </div>

        {/* Right Col: Quick Actions, Today's Workout & Food Log */}
        <div className="space-y-6">
          {/* Prescribed Training for Today */}
          <div className="bg-zinc-950 text-white rounded-xl p-6 shadow-xs border border-zinc-900">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400">
                Periodização do Dia
              </span>
              <Dumbbell className="w-4 h-4 text-emerald-400" />
            </div>

            <h4 className="text-base font-bold tracking-tight">
              Treino A: Membros Superiores & HIIT
            </h4>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Adaptado para academia e corrida. Estimativa de gasto calórico de 420 kcal.
            </p>

            <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
              <Link
                href="/dashboard/exercise"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <span>Ver Ficha Completa</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <span className="text-[11px] font-mono text-zinc-500">45 min previstos</span>
            </div>
          </div>

          {/* Today's Logged Meals */}
          <div className="bg-white rounded-xl border border-zinc-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100">
              <h3 className="text-xs font-bold text-zinc-950 uppercase tracking-wider">
                Refeições de Hoje ({foodEntries.length})
              </h3>
              <Link
                href="/dashboard/food"
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Ver Todas
              </Link>
            </div>

            {foodEntries.length === 0 ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
                  <Camera className="w-5 h-5" />
                </div>
                <p className="text-xs text-zinc-600 font-medium">
                  Nenhuma refeição registrada hoje.
                </p>
                <Link
                  href="/dashboard/food"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Fotografar primeiro prato
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {foodEntries.slice(0, 3).map((entry) => (
                  <MealCard key={entry.id} entry={entry} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
