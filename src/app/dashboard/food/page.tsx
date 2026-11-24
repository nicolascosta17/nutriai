"use client";

import { useEffect, useState } from "react";
import { 
  Camera, 
  Calendar, 
  Filter, 
  UtensilsCrossed, 
  Dna, 
  Wheat, 
  Droplet, 
  Flame, 
  Plus, 
  RefreshCw 
} from "lucide-react";
import FoodPhotoUpload from "@/components/FoodPhotoUpload";
import MealCard from "@/components/MealCard";
import EmptyState from "@/components/EmptyState";
import LoadingSpinner from "@/components/LoadingSpinner";
import type { FoodEntry } from "@/types";
import { toast } from "sonner";

export default function FoodPage() {
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [showUpload, setShowUpload] = useState(false);

  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/food-entries?date=${selectedDate}&range=day`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || []);
      }
    } catch {
      toast.error("Erro ao carregar diário alimentar.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [selectedDate]);

  const handleDelete = async (id: string) => {
    setEntries((prev) => prev.filter((item) => item.id !== id));
    toast.success("Registro de refeição removido.");
  };

  // Group by meal type
  const breakfastMeals = entries.filter((e) => e.meal_type === "breakfast");
  const lunchMeals = entries.filter((e) => e.meal_type === "lunch");
  const dinnerMeals = entries.filter((e) => e.meal_type === "dinner");
  const snackMeals = entries.filter((e) => e.meal_type === "snack" || !e.meal_type);

  // Totals
  const totalCalories = entries.reduce((acc, curr) => acc + (curr.calories || 0), 0);
  const totalProtein = entries.reduce((acc, curr) => acc + (Number(curr.protein_g) || 0), 0);
  const totalCarbs = entries.reduce((acc, curr) => acc + (Number(curr.carbs_g) || 0), 0);
  const totalFat = entries.reduce((acc, curr) => acc + (Number(curr.fat_g) || 0), 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
            Diário Fotográfico & Balanço de Macros
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Cada refeição registrada é decomposta nutricionalmente com base em visão computacional.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 text-xs font-mono font-medium rounded-lg border border-zinc-300 bg-white text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-950"
          />

          <button
            onClick={() => setShowUpload(!showUpload)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold transition-all shadow-xs"
          >
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>{showUpload ? "Fechar Fotografia" : "Nova Foto de Refeição"}</span>
          </button>
        </div>
      </div>

      {/* Upload Zone (collapsible or permanent) */}
      {showUpload && (
        <div className="animate-slide-up">
          <FoodPhotoUpload
            onAnalysisComplete={() => {
              fetchEntries();
              setShowUpload(false);
            }}
          />
        </div>
      )}

      {/* Daily Macro Bar Strip */}
      <div className="p-4 sm:p-5 rounded-xl bg-zinc-950 text-white border border-zinc-900 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">
            Calorias Computadas
          </span>
          <span className="text-2xl font-bold font-mono text-emerald-400">
            {totalCalories} <span className="text-xs font-normal text-zinc-400">kcal</span>
          </span>
        </div>
        <div>
          <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">
            Proteínas Totais
          </span>
          <span className="text-2xl font-bold font-mono text-zinc-100">
            {Math.round(totalProtein)} <span className="text-xs font-normal text-zinc-400">g</span>
          </span>
        </div>
        <div>
          <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">
            Carboidratos
          </span>
          <span className="text-2xl font-bold font-mono text-zinc-100">
            {Math.round(totalCarbs)} <span className="text-xs font-normal text-zinc-400">g</span>
          </span>
        </div>
        <div>
          <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">
            Lipídios
          </span>
          <span className="text-2xl font-bold font-mono text-zinc-100">
            {Math.round(totalFat)} <span className="text-xs font-normal text-zinc-400">g</span>
          </span>
        </div>
      </div>

      {/* Entries sections */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="md" text="Buscando refeições do dia..." />
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title="Nenhuma refeição registrada nesta data"
          description="Utilize a câmera para registrar seus pratos e obter a análise volumétrica e calórica instantânea."
          actionLabel="Fotografar Refeição Agora"
          onAction={() => setShowUpload(true)}
        />
      ) : (
        <div className="space-y-8">
          {/* Desjejum */}
          {breakfastMeals.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-2">
                <span>Desjejum (Café da Manhã)</span>
                <span className="text-[10px] font-mono text-zinc-400">({breakfastMeals.length})</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {breakfastMeals.map((meal) => (
                  <MealCard key={meal.id} entry={meal} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}

          {/* Almoço */}
          {lunchMeals.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-2">
                <span>Almoço</span>
                <span className="text-[10px] font-mono text-zinc-400">({lunchMeals.length})</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lunchMeals.map((meal) => (
                  <MealCard key={meal.id} entry={meal} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}

          {/* Jantar */}
          {dinnerMeals.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-2">
                <span>Jantar</span>
                <span className="text-[10px] font-mono text-zinc-400">({dinnerMeals.length})</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dinnerMeals.map((meal) => (
                  <MealCard key={meal.id} entry={meal} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}

          {/* Lanches */}
          {snackMeals.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-2">
                <span>Fracionamentos & Lanches Intermediários</span>
                <span className="text-[10px] font-mono text-zinc-400">({snackMeals.length})</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {snackMeals.map((meal) => (
                  <MealCard key={meal.id} entry={meal} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
