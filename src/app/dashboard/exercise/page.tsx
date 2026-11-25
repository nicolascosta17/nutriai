"use client";

import { useEffect, useState } from "react";
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
import ExercisePlanCard from "@/components/ExercisePlanCard";
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
    // Mock robust clinical routine adapted to gym + outdoor running/cycling/walking
    setPlan({
      id: "plan-ex-1",
      user_id: "user-1",
      plan_name: "Periodização Híbrida: Força & Condicionamento Metabólico",
      goal: "Otimização de Déficit Calórico & Preservação Muscular",
      difficulty: "intermediate",
      is_active: true,
      created_at: new Date().toISOString(),
      schedule: {
        Segunda: [
          {
            name: "Supino Reto com Barra ou Halteres",
            sets: 4,
            reps: "8 a 10 reps",
            duration: "8 min",
            instructions: "Mantenha as escápulas aduzidas e os pés firmes no solo. Controle a fase excêntrica em 2 segundos."
          },
          {
            name: "Puxada Frontal na Polia Alta ou Barra Fixa",
            sets: 4,
            reps: "10 a 12 reps",
            duration: "8 min",
            instructions: "Puxe o implemento em direção à fúrcula esternal, evitando balanço lombar excessivo."
          },
          {
            name: "Desenvolvimento de Ombros com Halteres",
            sets: 3,
            reps: "10 a 12 reps",
            duration: "6 min",
            instructions: "Eleve os pesos sem estender totalmente os cotovelos para manter a tensão mecânica."
          },
          {
            name: "HIIT na Esteira ou Corrida Intervalada Externa",
            sets: 1,
            reps: "10 tiros de 1 min / 1 min leve",
            duration: "20 min",
            instructions: "Alterne 1 minuto em velocidade vigorosa (80-85% FCmáx) com 1 minuto de recuperação ativa."
          }
        ],
        Terça: [
          {
            name: "Agachamento Livre com Barra ou no Smith",
            sets: 4,
            reps: "8 a 10 reps",
            duration: "10 min",
            instructions: "Desça mantendo a coluna alinhada e os joelhos alinhados com a ponta dos pés."
          },
          {
            name: "Leg Press 45° ou Avanço com Halteres",
            sets: 4,
            reps: "10 a 12 reps",
            duration: "8 min",
            instructions: "Foco no quadríceps e estabilização de pelve."
          },
          {
            name: "Mesa Flexora ou Stiff com Halteres",
            sets: 4,
            reps: "10 a 12 reps",
            duration: "8 min",
            instructions: "Controle da cadeia posterior de membros inferiores."
          },
          {
            name: "Caminhada Inclinada ou Pedal Leve (LISS)",
            sets: 1,
            reps: "Contínuo",
            duration: "25 min",
            instructions: "Zona 2 cardíaca (60-70% FCmáx) para oxidação lipídica mitocondrial."
          }
        ],
        Quarta: [
          {
            name: "Sessão Ativa de Recuperação & Mobilidade Articular",
            sets: 3,
            reps: "Série fluida",
            duration: "30 min",
            instructions: "Exercícios de mobilidade de quadril, tornozelo e coluna torácica combinados com caminhada externa ao ar livre."
          }
        ],
        Quinta: [
          {
            name: "Levantamento Terra Romeno ou Tradicional",
            sets: 4,
            reps: "6 a 8 reps",
            duration: "10 min",
            instructions: "Fortalecimento do complexo lombar e glúteos com técnica estrita."
          },
          {
            name: "Remada Curvada com Barra Pegada Pronada",
            sets: 4,
            reps: "8 a 10 reps",
            duration: "8 min",
            instructions: "Mantenha o tronco estável a 45 graus e cotovelos fechados."
          },
          {
            name: "Elevação Lateral de Ombros com Halteres",
            sets: 4,
            reps: "12 a 15 reps",
            duration: "6 min",
            instructions: "Foco no deltoide lateral sem impulso."
          },
          {
            name: "Ciclismo / Bike Estacionária Intervalada",
            sets: 1,
            reps: "Tiros moderados",
            duration: "25 min",
            instructions: "Estímulo de potência aeróbica intercalando cadências."
          }
        ],
        Sexta: [
          {
            name: "Afundo Búlgaro ou Passada com Carga",
            sets: 3,
            reps: "10 reps cada perna",
            duration: "8 min",
            instructions: "Excelente recrutamento glúteo unilateral."
          },
          {
            name: "Crucifixo Inclinado com Halteres",
            sets: 3,
            reps: "12 reps",
            duration: "6 min",
            instructions: "Estiramento controlado das fibras do peitoral maior."
          },
          {
            name: "Tríceps Corda e Rosca Direta em Bisset",
            sets: 3,
            reps: "12 reps cada",
            duration: "8 min",
            instructions: "Série conjugada para estímulo de braços."
          },
          {
            name: "Corrida Contínua em Ritmo Moderado",
            sets: 1,
            reps: "5 km",
            duration: "30 min",
            instructions: "Mantenha respiração ritmada com foco em resistência cardiorrespiratória."
          }
        ],
        Sábado: [
          {
            name: "Caminhada ou Ciclismo Outdoor ao Ar Livre",
            sets: 1,
            reps: "Livre",
            duration: "45 a 60 min",
            instructions: "Manutenção do gasto calórico ativo de fim de semana (NEAT elevado)."
          }
        ],
        Domingo: [
          {
            name: "Descanso Pleno & Regeneração Tecidual",
            sets: 0,
            reps: "Repouso",
            duration: "Dia Livre",
            instructions: "Sono de qualidade para recomposição muscular e reabastecimento de glicogênio hepático."
          }
        ]
      },
      exercises: []
    });
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
              <span className="text-base font-bold text-white font-mono">5 dias ativos</span>
            </div>
            <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 text-xs">
              <span className="text-zinc-400 block">Gasto Estimado</span>
              <span className="text-base font-bold text-emerald-400 font-mono">~2.200 kcal/sem</span>
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
            {completedExercises.length} concluídos nesta sessão
          </span>
        </div>

        {currentDayExercises.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-zinc-200 text-zinc-500 text-xs">
            Dia livre programado para recuperação metabólica e celular.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentDayExercises.map((exercise, idx) => {
              const isDone = completedExercises.includes(exercise.name);
              return (
                <div
                  key={idx}
                  className={`bg-white rounded-xl border p-5 transition-all shadow-xs ${
                    isDone ? "border-emerald-200 bg-emerald-50/20" : "border-zinc-200/80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-semibold">
                          {exercise.sets} séries × {exercise.reps}
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
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleComplete(exercise.name)}
                      className={`p-1.5 rounded-lg border transition-colors shrink-0 ${
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
