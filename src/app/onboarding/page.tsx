"use client";

import NutriLogo from "@/components/NutriLogo";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Flame, 
  Scale, 
  Target, 
  Dumbbell, 
  Sparkles,
  Heart,
  TrendingDown,
  Loader2
} from "lucide-react";
import { calculateBMI, calculateBMR, calculateTDEE, calculateMacroTargets, getWeightStatus } from "@/lib/nutrition";
import { toast } from "sonner";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [weightKg, setWeightKg] = useState<number>(78);
  const [heightCm, setHeightCm] = useState<number>(175);
  const [age, setAge] = useState<number>(29);
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [goal, setGoal] = useState<"lose_weight" | "gain_muscle" | "maintain" | "health">("lose_weight");
  const [activityLevel, setActivityLevel] = useState<"sedentary" | "light" | "moderate" | "active" | "very_active">("moderate");
  const [equipment, setEquipment] = useState<string[]>(["gym", "running"]);
  const [targetWeightKg, setTargetWeightKg] = useState<number>(72);

  // Live calculations
  const bmi = calculateBMI(weightKg, heightCm);
  const bmiStatus = getWeightStatus(bmi);
  const bmr = calculateBMR(weightKg, heightCm, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);
  const targetCalories = goal === "lose_weight" 
    ? Math.round(tdee - 500) 
    : goal === "gain_muscle" 
    ? Math.round(tdee + 300) 
    : tdee;
  const macros = calculateMacroTargets(targetCalories, goal);

  const toggleEquipment = (id: string) => {
    setEquipment((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight_kg: weightKg,
          height_cm: heightCm,
          age,
          gender,
          goal,
          activity_level: activityLevel,
          available_equipment: equipment,
          target_weight_kg: targetWeightKg,
        }),
      });

      // Also trigger initial diet and workout generation in background
      fetch("/api/generate-diet", { method: "POST" }).catch(() => null);
      fetch("/api/generate-workout", { method: "POST" }).catch(() => null);

      toast.success("Protocolo metabólico inicializado com sucesso!");
      router.push("/dashboard");
    } catch {
      toast.info("Perfil configurado. Redirecionando para o painel...");
      router.push("/dashboard");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-200">
          <div className="flex items-center gap-2.5">
            <NutriLogo className="h-8 w-8" />
            <div>
              <span className="text-sm font-bold text-zinc-950">NutriAI Clinical</span>
              <span className="text-xs text-zinc-500 block">Protocolo de Anamnese & Prescrição</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono font-semibold text-zinc-700">Etapa {step} de 4</span>
            <div className="w-32 bg-zinc-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div 
                className="bg-emerald-600 h-full transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Step Card */}
        <div className="bg-white rounded-xl border border-zinc-200/90 shadow-xs p-6 sm:p-8">
          {/* STEP 1: Biometria */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  Parâmetros Antropométricos
                </span>
                <h2 className="text-xl font-bold text-zinc-950 mt-1">
                  Dados Físicos & Composição Inicial
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Utilizados para o cálculo da Taxa Metabólica Basal (Equação de Mifflin-St Jeor).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Peso Atual (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={weightKg}
                    onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-950 font-mono"
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
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-950 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Idade Cronológica (anos)
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-950 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Sexo Biológico (Fator Hormonal / TMB)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGender("male")}
                      className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                        gender === "male"
                          ? "bg-zinc-900 text-white border-zinc-950"
                          : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"
                      }`}
                    >
                      Masculino
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender("female")}
                      className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                        gender === "female"
                          ? "bg-zinc-900 text-white border-zinc-950"
                          : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"
                      }`}
                    >
                      Feminino
                    </button>
                  </div>
                </div>
              </div>

              {/* Real-time Anthropometric feedback */}
              <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200/80 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-zinc-500 block">Índice de Massa Corporal (IMC):</span>
                  <span className="text-base font-bold text-zinc-900 font-mono">{bmi} kg/m²</span>
                  <span className="text-emerald-700 font-medium block mt-0.5">{bmiStatus}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Gasto Basal Estimado (TMB):</span>
                  <span className="text-base font-bold text-zinc-900 font-mono">{bmr} kcal/dia</span>
                  <span className="text-zinc-500 text-[11px] block mt-0.5">Sem considerar atividade física</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Objetivo Clínico */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  Diretriz Metabólica
                </span>
                <h2 className="text-xl font-bold text-zinc-950 mt-1">
                  Qual é o seu objetivo prioritário?
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Definirá o déficit calórico prescrito e a relação de proteínas por quilograma corporal.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  {
                    id: "lose_weight",
                    title: "Déficit Calórico & Emagrecimento",
                    desc: "Redução de gordura visceral e subcutânea preservando massa magra.",
                    icon: TrendingDown,
                    badge: "-500 kcal/dia",
                  },
                  {
                    id: "gain_muscle",
                    title: "Hipertrofia Muscular",
                    desc: "Superávit controlado para otimização de síntese proteica miofibrilar.",
                    icon: Dumbbell,
                    badge: "+300 kcal/dia",
                  },
                  {
                    id: "maintain",
                    title: "Recomposição & Manutenção",
                    desc: "Manutenção de peso estrita com remodelação de composição tecidual.",
                    icon: Scale,
                    badge: "Equilíbrio neutro",
                  },
                  {
                    id: "health",
                    title: "Otimização Metabólica",
                    desc: "Equilíbrio glicêmico, melhora do perfil lipídico e micronutrientes.",
                    icon: Heart,
                    badge: "Densidade máxima",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = goal === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setGoal(item.id as typeof goal)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "border-zinc-950 bg-zinc-900 text-white shadow-xs"
                          : "border-zinc-200 bg-white hover:border-zinc-300 text-zinc-900"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`w-4 h-4 ${isSelected ? "text-emerald-400" : "text-zinc-600"}`} />
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          isSelected ? "bg-zinc-800 text-emerald-300" : "bg-zinc-100 text-zinc-600"
                        }`}>
                          {item.badge}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold">{item.title}</h3>
                      <p className={`text-xs mt-1 ${isSelected ? "text-zinc-400" : "text-zinc-500"}`}>
                        {item.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Target Weight input */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Meta de Peso Alvo (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={targetWeightKg}
                  onChange={(e) => setTargetWeightKg(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-950 font-mono"
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  Diferença planejada: {Math.abs(weightKg - targetWeightKg).toFixed(1)} kg de variação corporal.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: Nível de Atividade & Equipamentos */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  Estilo de Vida & Infraestrutura
                </span>
                <h2 className="text-xl font-bold text-zinc-950 mt-1">
                  Atividade Diária & Modalidades Disponíveis
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  O aplicativo criará uma periodização intercalada com base no que você realmente tem acesso.
                </p>
              </div>

              {/* Activity Level */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-2">
                  Nível de Demanda Energética Rotineira
                </label>
                <div className="space-y-2">
                  {[
                    { id: "sedentary", label: "Sedentário", desc: "Trabalho em escritório, pouca locomoção diária" },
                    { id: "light", label: "Levemente Ativo", desc: "1 a 3 dias/semana de estímulo ou caminhadas" },
                    { id: "moderate", label: "Moderadamente Ativo", desc: "3 a 5 dias/semana de treinos regulares" },
                    { id: "active", label: "Altamente Ativo", desc: "6 a 7 dias/semana de atividade vigorosa" },
                  ].map((act) => (
                    <div
                      key={act.id}
                      onClick={() => setActivityLevel(act.id as typeof activityLevel)}
                      className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${
                        activityLevel === act.id
                          ? "border-zinc-950 bg-zinc-900 text-white"
                          : "border-zinc-200 hover:border-zinc-300 text-zinc-900"
                      }`}
                    >
                      <div>
                        <p className="text-xs font-semibold">{act.label}</p>
                        <p className={`text-[11px] ${activityLevel === act.id ? "text-zinc-400" : "text-zinc-500"}`}>
                          {act.desc}
                        </p>
                      </div>
                      {activityLevel === act.id && <Check className="w-4 h-4 text-emerald-400" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Equipment Checkboxes */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-2">
                  Acesso a Modalidades de Treino (marque todas as aplicáveis)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: "gym", label: "Academia / Pesos" },
                    { id: "running", label: "Corrida Externa / Esteira" },
                    { id: "cycling", label: "Ciclismo / Bike" },
                    { id: "walking", label: "Caminhada Orientada" },
                    { id: "home_workout", label: "Treino em Casa (Calistenia)" },
                    { id: "yoga", label: "Alongamento / Mobilidade" },
                  ].map((eq) => {
                    const isChecked = equipment.includes(eq.id);
                    return (
                      <button
                        key={eq.id}
                        type="button"
                        onClick={() => toggleEquipment(eq.id)}
                        className={`p-2.5 text-xs font-medium rounded-lg border text-left flex items-center justify-between transition-all ${
                          isChecked
                            ? "border-emerald-600 bg-emerald-50/70 text-emerald-950"
                            : "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700"
                        }`}
                      >
                        <span>{eq.label}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Sumário e Prescrição Final */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  Prescrição Estruturada
                </span>
                <h2 className="text-xl font-bold text-zinc-950 mt-1">
                  Seu Plano Nutricional Personalizado
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Síntese dos parâmetros metabólicos gerados pelo algoritmo clínico.
                </p>
              </div>

              {/* Target Calories Big Metric */}
              <div className="p-6 rounded-xl bg-zinc-950 text-white border border-zinc-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Meta Calórica Diária Prescrita
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-extrabold font-mono text-emerald-400">
                      {targetCalories}
                    </span>
                    <span className="text-sm font-medium text-zinc-300">kcal / dia</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-2">
                    Gasto total estimado: {tdee} kcal. Déficit planejado de {tdee - targetCalories} kcal para emagrecimento sustentável.
                  </p>
                </div>
                <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 text-xs space-y-1 sm:text-right">
                  <div className="text-zinc-400">Peso Inicial: <span className="text-white font-mono">{weightKg} kg</span></div>
                  <div className="text-zinc-400">Meta: <span className="text-emerald-400 font-mono">{targetWeightKg} kg</span></div>
                  <div className="text-zinc-400">Modalidades: <span className="text-white">{equipment.length} selecionadas</span></div>
                </div>
              </div>

              {/* Macros Breakdown */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
                  Distribuição de Macronutrientes Recomendada
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl border border-zinc-200 bg-white">
                    <span className="text-xs text-zinc-500 block">Proteínas</span>
                    <span className="text-xl font-bold font-mono text-zinc-950">{macros.protein_g}g</span>
                    <span className="text-[11px] text-zinc-400 block mt-0.5">
                      {(macros.protein_g / weightKg).toFixed(1)}g / kg corporal
                    </span>
                  </div>
                  <div className="p-4 rounded-xl border border-zinc-200 bg-white">
                    <span className="text-xs text-zinc-500 block">Carboidratos</span>
                    <span className="text-xl font-bold font-mono text-zinc-950">{macros.carbs_g}g</span>
                    <span className="text-[11px] text-zinc-400 block mt-0.5">Energia de treino</span>
                  </div>
                  <div className="p-4 rounded-xl border border-zinc-200 bg-white">
                    <span className="text-xs text-zinc-500 block">Gorduras Boas</span>
                    <span className="text-xl font-bold font-mono text-zinc-950">{macros.fat_g}g</span>
                    <span className="text-[11px] text-zinc-400 block mt-0.5">Equilíbrio hormonal</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 pt-6 border-t border-zinc-100 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-950 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Voltar
              </button>
            ) : <div />}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold transition-all shadow-xs"
              >
                <span>Avançar</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-xs disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Iniciando Protocolo...</span>
                  </>
                ) : (
                  <>
                    <span>Confirmar Prescrição e Acessar Painel</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
