"use client";

import { useEffect, useState } from "react";
import { 
  User, 
  Scale, 
  Activity, 
  Save, 
  Flame, 
  Check, 
  TrendingDown, 
  Plus, 
  Loader2 
} from "lucide-react";
import WeightChart from "@/components/WeightChart";
import LoadingSpinner from "@/components/LoadingSpinner";
import { calculateBMI, calculateBMR, calculateTDEE, getWeightStatus } from "@/lib/nutrition";
import type { Profile, WeightLog } from "@/types";
import { toast } from "sonner";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [weightKg, setWeightKg] = useState(78);
  const [heightCm, setHeightCm] = useState(175);
  const [age, setAge] = useState(29);
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [goal, setGoal] = useState<"lose_weight" | "gain_muscle" | "maintain" | "health">("lose_weight");
  const [activityLevel, setActivityLevel] = useState<"sedentary" | "light" | "moderate" | "active" | "very_active">("moderate");
  const [targetWeightKg, setTargetWeightKg] = useState(72);

  // Weight Logging
  const [newWeight, setNewWeight] = useState("");
  const [isLogging, setIsLogging] = useState(false);
  const [weightHistory, setWeightHistory] = useState<WeightLog[]>([]);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) throw new Error("Não foi possível carregar seu perfil.");
        {
          const data = await res.json();
          if (data.profile) {
            const p = data.profile;
            setProfile(p);
            setName(p.name ?? "");
            setWeightKg(p.weight_kg || 78);
            setHeightCm(p.height_cm || 175);
            setAge(p.age || 29);
            setGender(p.gender || "male");
            setGoal(p.goal || "lose_weight");
            setActivityLevel(p.activity_level || "moderate");
            setTargetWeightKg(p.target_weight_kg || 72);
          }
        }

        const history = await fetch("/api/weight-history");
        if (!history.ok) throw new Error("Não foi possível carregar seu histórico de peso.");
        setWeightHistory((await history.json()).history);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao carregar prontuário.");
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, []);

  // Computed values
  const bmi = calculateBMI(weightKg, heightCm);
  const bmiStatus = getWeightStatus(bmi);
  const bmr = calculateBMR(weightKg, heightCm, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);
  const calorieTarget = goal === "lose_weight" 
    ? Math.round(tdee - 500) 
    : goal === "gain_muscle" 
    ? Math.round(tdee + 300) 
    : tdee;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          weight_kg: weightKg,
          height_cm: heightCm,
          age,
          gender,
          goal,
          activity_level: activityLevel,
          target_weight_kg: targetWeightKg,
        }),
      });

      if (!res.ok) {
        const result = await res.json().catch(() => null);
        throw new Error(result?.error || "Não foi possível salvar o perfil.");
      }
      toast.success("Parâmetros metabólicos atualizados.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar o perfil.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogging) return;
    const weight = Number(newWeight.replace(",", "."));
    if (!Number.isFinite(weight) || weight <= 0) {
      toast.error("Informe um peso válido.");
      return;
    }
    setIsLogging(true);
    try {
      const res = await fetch("/api/weight-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight_kg: weight }),
      });
      const result = await res.json().catch(() => null);
      if (!res.ok || !result?.log) throw new Error(result?.error || "Não foi possível registrar seu peso.");
      setWeightKg(weight);
      setWeightHistory((previous) => [...previous.slice(-99), result.log]);
      setNewWeight("");
      toast.success("Peso registrado no histórico.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível registrar seu peso.");
    } finally {
      setIsLogging(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="lg" text="Carregando perfil clínico..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      {/* Header */}
      <div className="pb-6 border-b border-zinc-200">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
          Metabólico, Antropometria & Metas
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Ajuste seus parâmetros corporais para recalibração contínua do gasto calórico diário.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Profile Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSaveProfile} className="bg-white rounded-xl border border-zinc-200/80 p-6 shadow-xs space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 pb-3 border-b border-zinc-100">
              Dados do Paciente
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Nome do Paciente / Usuário
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Sexo Biológico
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as typeof gender)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-950 bg-white"
                >
                  <option value="male">Masculino</option>
                  <option value="female">Feminino</option>
                  <option value="other">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Peso Atual (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-950 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Estatura (cm)
                </label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-950 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Idade (anos)
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-950 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Meta de Peso Alvo (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={targetWeightKg}
                  onChange={(e) => setTargetWeightKg(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-950 font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Diretriz Nutricional / Objetivo
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value as typeof goal)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-950 bg-white"
              >
                <option value="lose_weight">Déficit Calórico & Emagrecimento (-500 kcal)</option>
                <option value="gain_muscle">Hipertrofia Muscular (+300 kcal)</option>
                <option value="maintain">Manutenção e Recomposição Corporal</option>
                <option value="health">Saúde Geral & Otimização Metabólica</option>
              </select>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Demanda de Atividade Física (Fator de Atividade)
              </label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value as typeof activityLevel)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-950 bg-white"
              >
                <option value="sedentary">Sedentário (pouco ou nenhum exercício)</option>
                <option value="light">Levemente Ativo (1 a 3 dias/semana)</option>
                <option value="moderate">Moderadamente Ativo (3 a 5 dias/semana)</option>
                <option value="active">Altamente Ativo (6 a 7 dias/semana)</option>
                <option value="very_active">Extremamente Ativo (atleta / treino intenso)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold transition-all shadow-xs disabled:opacity-70"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> : <Save className="w-4 h-4 text-emerald-400" />}
              <span>Salvar Alterações Antropométricas</span>
            </button>
          </form>
        </div>

        {/* Right Col: Clinical Index Readouts & Weight Logging */}
        <div className="space-y-6">
          {/* Calculated Indices */}
          <div className="p-6 rounded-xl bg-zinc-950 text-white border border-zinc-900 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Índices Fisiológicos Calculados
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                <span className="text-zinc-400">IMC Atual:</span>
                <span className="font-mono font-bold text-white text-sm">{bmi} kg/m²</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                <span className="text-zinc-400">Classificação:</span>
                <span className="font-semibold text-emerald-400">{bmiStatus}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                <span className="text-zinc-400">TMB (Mifflin-St Jeor):</span>
                <span className="font-mono font-bold text-white text-sm">{bmr} kcal</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                <span className="text-zinc-400">Gasto Total (TDEE):</span>
                <span className="font-mono font-bold text-white text-sm">{tdee} kcal</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-zinc-400 font-semibold">Alvo Prescrito:</span>
                <span className="font-mono font-extrabold text-emerald-400 text-base">{calorieTarget} kcal</span>
              </div>
            </div>
          </div>

          {/* Weight Logging Card */}
          <div className="bg-white rounded-xl border border-zinc-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-950">
              Registro Rápido de Peso
            </h3>
            <form onSubmit={handleLogWeight} className="flex gap-2">
              <input
                type="number"
                step="0.1"
                placeholder="Ex: 77.8"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-950 font-mono"
              />
              <button
                type="submit"
                  disabled={isLogging}
                className="px-4 py-2 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold"
              >
                Registrar
              </button>
            </form>

            {/* Weight Progression Chart */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-2">
                Curva de Emagrecimento (kg)
              </span>
              <WeightChart
                targetWeight={targetWeightKg}
                data={weightHistory.map((item) => ({
                  date: item.logged_at,
                  weight: item.weight_kg,
                }))}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
