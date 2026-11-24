"use client";

import { useState } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  UtensilsCrossed,
  Sparkles,
  Dna,
  Wheat,
  Droplet
} from "lucide-react";
import type { FoodEntry } from "@/types";

interface MealCardProps {
  entry: FoodEntry;
  onDelete?: (id: string) => void;
}

const mealLabels: Record<string, string> = {
  breakfast: "Desjejum",
  lunch: "Almoço",
  dinner: "Jantar",
  snack: "Fracionamento",
};

export default function MealCard({ entry, onDelete }: MealCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const mealKey = entry.meal_type || "lunch";
  const label = mealLabels[mealKey] || "Refeição";

  let timeAgo = "";
  try {
    timeAgo = formatDistanceToNow(new Date(entry.created_at), {
      addSuffix: true,
      locale: ptBR,
    });
  } catch {
    timeAgo = "Hoje";
  }

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    onDelete?.(entry.id);
    setConfirmDelete(false);
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200/80 hover:border-zinc-300 transition-all shadow-xs overflow-hidden">
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-4">
          {/* Photo Thumbnail */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0">
            {entry.photo_url && !entry.photo_url.startsWith("data:") ? (
              <Image
                src={entry.photo_url}
                alt={entry.food_name || "Refeição"}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-400">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-zinc-100 text-zinc-700 border border-zinc-200">
                {label}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <span>{timeAgo}</span>
                {onDelete && (
                  <button
                    onClick={handleDelete}
                    className={`ml-2 p-1 rounded hover:bg-zinc-100 transition-colors ${
                      confirmDelete ? "text-red-600 font-medium" : "text-zinc-400 hover:text-red-500"
                    }`}
                    title={confirmDelete ? "Confirmar exclusão?" : "Excluir refeição"}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <h4 className="text-sm font-semibold text-zinc-950 mt-1 truncate">
              {entry.food_name || "Refeição Registrada"}
            </h4>

            {entry.description && (
              <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">
                {entry.description}
              </p>
            )}

            {/* Macro Stats Strip */}
            <div className="mt-3 flex items-center flex-wrap gap-x-4 gap-y-1 text-xs">
              <span className="font-bold text-zinc-900 font-mono">
                {entry.calories ?? 0} <span className="font-normal text-zinc-500 text-[11px]">kcal</span>
              </span>
              <span className="inline-flex items-center gap-1 text-zinc-600 font-mono">
                <Dna className="w-3 h-3 text-blue-600" />
                {entry.protein_g ?? 0}g P
              </span>
              <span className="inline-flex items-center gap-1 text-zinc-600 font-mono">
                <Wheat className="w-3 h-3 text-amber-600" />
                {entry.carbs_g ?? 0}g C
              </span>
              <span className="inline-flex items-center gap-1 text-zinc-600 font-mono">
                <Droplet className="w-3 h-3 text-rose-600" />
                {entry.fat_g ?? 0}g L
              </span>
            </div>
          </div>
        </div>

        {/* Expandable AI Analysis */}
        {entry.ai_analysis && (
          <div className="mt-3 pt-3 border-t border-zinc-100">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center justify-between w-full text-[11px] font-medium text-zinc-500 hover:text-zinc-800 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                Avaliação Nutricional Estruturada
              </span>
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {expanded && (
              <div className="mt-2 text-xs text-zinc-600 leading-relaxed bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                {entry.ai_analysis}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
