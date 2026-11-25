export const trainingDays = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"] as const;
export const trainingQuestions = [
  { key: "minutes", question: "Quanto tempo cabe em um dia corrido?", choices: [["15", "15 minutos"], ["25", "25 minutos"], ["40", "40 minutos"]] },
  { key: "focus", question: "O que você mais quer melhorar nas próximas semanas?", choices: [["strength", "Ganhar força"], ["stamina", "Ter mais fôlego"], ["routine", "Criar uma rotina equilibrada"]] },
  { key: "experience", question: "Como tem sido sua rotina de treino?", choices: [["start", "Estou começando ou voltando"], ["regular", "Já treino com regularidade"]] },
  { key: "push", question: "Qual flexão você consegue fazer com controle?", choices: [["wall", "Com as mãos na parede"], ["floor", "No chão"], ["avoid", "Prefiro evitar flexões por enquanto"]] },
  { key: "squat", question: "Você consegue fazer um agachamento sem apoio, com controle e conforto?", choices: [["free", "Sim, consigo sem apoio"], ["adapt", "Preciso de uma adaptação ou ainda não sei"], ["avoid", "Prefiro evitar agachamentos por enquanto"]] },
  { key: "legs", question: "Para escolher uma adaptação, como você se levanta de uma cadeira?", choices: [["free", "Consigo levantar sem usar as mãos"], ["support", "Preciso usar as mãos ou outro apoio"], ["avoid", "Prefiro evitar esse movimento"]] },
  { key: "pull", question: "Como é para você puxar algo em direção ao corpo, como numa remada?", choices: [["comfortable", "Consigo fazer esse movimento com controle"], ["avoid", "Prefiro evitar puxadas e remadas"]] },
  { key: "impact", question: "Que tipo de esforço você prefere para ganhar fôlego?", choices: [["run", "Corrida é uma opção"], ["low", "Prefiro opções sem corrida, como caminhada ou bike"], ["avoid", "Prefiro deixar o cardio fora por enquanto"]] },
] as const;

export type TrainingAnswers = {
  days: string[];
  minutes: "15" | "25" | "40";
  focus: "strength" | "stamina" | "routine";
  experience: "start" | "regular";
  push: "wall" | "floor" | "avoid";
  squat?: "free" | "adapt" | "avoid";
  legs: "free" | "support" | "avoid";
  pull: "comfortable" | "avoid";
  impact: "run" | "low" | "avoid";
};

export function visibleTrainingQuestions(squat: TrainingAnswers["squat"]) {
  return trainingQuestions.filter(({ key }) => key !== "legs" || squat === "adapt");
}

export function parseTrainingAnswers(value: unknown): TrainingAnswers | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  if (!Array.isArray(input.days) || input.days.length < 1 || input.days.length > 7) return null;
  const requestedDays = input.days;
  const days = trainingDays.filter((day) => requestedDays.includes(day));
  if (days.length !== requestedDays.length) return null;
  const answers: Record<string, unknown> = { days };
  for (const question of trainingQuestions) {
    if (question.key === "squat" && input.squat === undefined) continue;
    const answer = question.key === "legs" && (input.squat === "free" || input.squat === "avoid")
      ? input.squat
      : input[question.key];
    if (!question.choices.some(([choice]) => choice === answer)) return null;
    answers[question.key] = answer;
  }
  return answers as TrainingAnswers;
}
