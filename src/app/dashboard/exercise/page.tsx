"use client";

import Link from "next/link";
import { exerciseDemonstration } from "@/lib/exercise-checklist";
import { Fragment, useEffect, useState } from "react";
import { 
  Dumbbell, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  Circle, 
  Flame, 
  Clock, 
  MapPin, 
  TrendingUp, 
  RefreshCw 
} from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import type { ExercisePlan, ExerciseDetail } from "@/types";
import { toast } from "sonner";

const DAYS = [
  { key: "Segunda", label: "Segunda-feira", code: "SEG" },
  { key: "Terça", label: "Terça-feira", code: "TER" },
  { key: "Quarta", label: "Quarta-feira", code: "QUA" },
  { key: "Quinta", label: "Quinta-feira", code: "QUI" },
  { key: "Sexta", label: "Sexta-feira", code: "SEX" },
  { key: "Sábado", label: "Sábado", code: "SÁB" },
  { key: "Domingo", label: "Domingo", code: "DOM" },
];

export default function ExercisePage() {
  const [plan, setPlan] = useState<ExercisePlan | null>(null);
  const [selectedDay, setSelectedDay] = useState("Segunda");
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/generate-workout")
      .then(async (res) => {
        if (!res.ok) throw new Error("Falha ao carregar o treino.");
        const { plan: savedPlan } = await res.json();
        if (savedPlan) setPlan(savedPlan);
      })
      .catch(() => toast.error("Não foi possível carregar seu treino salvo."))
      .finally(() => setIsLoading(false));
  }, []);

  const handleToggleComplete = (name: string) => {
    setCompletedExercises((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
    );
  };

  const handleGenerateWorkout = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-workout", { method: "POST" });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Falha na geração do treino.");
      }
      const data = await res.json();
      if (!data.plan) throw new Error("O servidor não retornou o plano de treino.");
      setPlan(data.plan);
      toast.success("Periodização de treino gerada e adaptada com sucesso!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível gerar o plano de treino.");
    } finally {
      setIsGenerating(false);
    }
  };

  const currentDayExercises: ExerciseDetail[] = plan?.schedule?.[selectedDay] || [];
  const rowKey = (index: number) => `${plan?.id ?? "none"}:${selectedDay}:${index}`;
  const completedToday = currentDayExercises.filter((_, index) => completedExercises.includes(rowKey(index))).length;
  const activeDays = DAYS.filter(({ key }) => plan?.schedule?.[key]?.some((exercise) => exercise.sets > 0)).length;

  if (isLoading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="lg" text="Carregando tabela de treino..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
            Periodização de Treino Intercalada
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Prescrição sincronizada com seu acesso: academia, corrida, bike e caminhada.
          </p>
        </div>

        <button
          onClick={handleGenerateWorkout}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold transition-all shadow-xs disabled:opacity-70"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Preparando treino…</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Adaptar treino</span>
            </>
          )}
        </button>
      </div>

      {/* Plan Info Card */}
      {plan && (
        <div className="p-6 rounded-xl bg-zinc-950 text-white border border-zinc-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400">
              Divisão Semanal Personalizada
            </span>
            <h2 className="text-xl font-bold tracking-tight mt-1">
              {plan.plan_name}
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Objetivo: {plan.goal} • Nível: {plan.difficulty}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 text-xs">
              <span className="text-zinc-400 block">Estímulos Semanais</span>
              <span className="text-base font-bold text-white font-mono">{activeDays} dias ativos</span>
            </div>
          </div>
        </div>
      )}

      {/* Day Selector Pills */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">
          Cronograma Semanal
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {DAYS.map((day) => {
            const isSelected = selectedDay === day.key;
            const count = plan?.schedule?.[day.key]?.length || 0;
            return (
              <button
                key={day.key}
                type="button"
                onClick={() => setSelectedDay(day.key)}
                className={`py-3 px-2 rounded-xl border text-center transition-all ${
                  isSelected
                    ? "border-zinc-950 bg-zinc-900 text-white shadow-xs"
                    : "border-zinc-200 bg-white hover:border-zinc-300 text-zinc-700"
                }`}
              >
                <span className="text-[11px] font-mono font-semibold block">{day.code}</span>
                <span className={`text-[10px] mt-1 block ${isSelected ? "text-emerald-400" : "text-zinc-400"}`}>
                  {count > 0 ? `${count} exerc.` : "Off"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Exercises List for selected day */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-900">
            Exercícios de {selectedDay}
          </h3>
          <span className="text-xs text-zinc-500 font-mono">
            {completedToday} de {currentDayExercises.length} concluídos
          </span>
        </div>

        {currentDayExercises.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-zinc-200 text-zinc-500 text-xs">
            {plan ? "Nenhum exercício programado para este dia." : "Salve suas preferências e toque em Adaptar treino para montar seu checklist."}
            {!currentDayExercises.length && (
              <Link href="/dashboard/account" className="mt-2 block font-semibold text-emerald-700 underline">Ver preferências de treino</Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentDayExercises.map((exercise, idx) => {
              const key = rowKey(idx);
              const isDone = completedExercises.includes(key);
              const demonstration = exerciseDemonstration(exercise.name);
              const showGroup = exercise.group && currentDayExercises[idx - 1]?.group !== exercise.group;
              return (
                <Fragment key={key}>
                  {showGroup && <h4 className="text-sm font-semibold text-zinc-900 md:col-span-2">{exercise.group}</h4>}
                  <div
                  className={`bg-white rounded-xl border p-5 transition-all shadow-xs ${
                    isDone ? "border-emerald-200 bg-emerald-50/20" : "border-zinc-200/80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-semibold">
                          {exercise.sets > 0 ? `${exercise.sets} ${exercise.sets === 1 ? "série" : "séries"} · ${exercise.reps}` : exercise.reps}
                        </span>
                        {exercise.duration && (
                          <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {exercise.duration}
                          </span>
                        )}
                      </div>
                      <h4 className={`text-sm font-semibold tracking-tight ${
                        isDone ? "text-emerald-950 line-through" : "text-zinc-950"
                      }`}>
                        {exercise.name}
                      </h4>
                      <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                        {exercise.instructions}
                      </p>
                      {demonstration && (
                        <a href={demonstration.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex min-h-11 items-center text-xs font-semibold text-emerald-700 underline">
                          {demonstration.label}
                        </a>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleComplete(key)}
                      aria-pressed={isDone}
                      aria-label={`${isDone ? "Desmarcar" : "Concluir"} ${exercise.name}`}
                      className={`grid min-h-11 min-w-11 place-items-center rounded-lg border transition-colors shrink-0 ${
                        isDone
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "border-zinc-300 text-zinc-400 hover:text-zinc-700 hover:border-zinc-400"
                      }`}
                      title={isDone ? "Marcar como pendente" : "Marcar como concluído"}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                  </div>
                </Fragment>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
