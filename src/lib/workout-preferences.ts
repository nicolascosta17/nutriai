export const workoutOptions = [
  { id: "gym", label: "Tenho acesso à academia", exercise: "Leg press" },
  { id: "running", label: "Corrida", exercise: "Corrida leve" },
  { id: "cycling", label: "Bicicleta", exercise: "Pedalada leve" },
  { id: "walking", label: "Caminhada", exercise: "Caminhada leve" },
  { id: "home_workout", label: "Treino em casa, sem equipamento", exercise: "Flexão na parede" },
  { id: "yoga", label: "Mobilidade e alongamento", exercise: "Mobilidade leve de ombros" },
  { id: "dumbbells", label: "Halteres", exercise: "Rosca com halteres" },
  { id: "resistance_bands", label: "Elásticos", exercise: "Remada com elástico" },
] as const;

export function exerciseKey(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
