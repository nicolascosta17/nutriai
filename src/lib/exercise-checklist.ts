import type { ExerciseDetail, ExerciseSchedule, Profile } from "@/types";
import { exerciseKey } from "@/lib/workout-preferences";

type Preferences = Pick<Profile, "available_equipment" | "excluded_exercises">;
type Group = "upper" | "lower" | "cardio" | "mobility";

const titles: Record<Group, string> = {
  upper: "Musculação • Membros superiores",
  lower: "Musculação • Membros inferiores",
  cardio: "Condicionamento",
  mobility: "Mobilidade",
};

const mayo = "https://www.mayoclinic.org/healthy-lifestyle/fitness/multimedia/";
const nhs = "https://www.nhs.uk/live-well/exercise/strength-exercises/";
const catalog = [
  { id: "chest-press", equipment: "gym", group: "upper", name: "Supino na máquina", cue: "Ajuste o banco para deixar as pegadas na altura do peito. Empurre devagar e volte sem travar os cotovelos.", video: mayo + "chest-press/vid-20084687" },
  { id: "cable-row", equipment: "gym", group: "upper", name: "Remada sentada no cabo", cue: "Puxe a alça em direção à cintura com o tronco estável. Retorne devagar.", video: mayo + "seated-row/vid-20084688" },
  { id: "lat-pulldown", equipment: "gym", group: "upper", name: "Puxada frontal na polia", cue: "Puxe a barra em direção à parte alta do peito e retorne com controle.", video: mayo + "lat-pull-down/vid-20084683" },
  { id: "leg-press", equipment: "gym", group: "lower", name: "Leg press sentado", cue: "Mantenha os pés apoiados e os joelhos na direção dos pés. Evite travar os joelhos.", video: mayo + "leg-press/vid-20084684" },
  { id: "wall-pushup", equipment: "home_workout", group: "upper", name: "Flexão na parede", cue: "Apoie as mãos na parede na altura do peito. Dobre os cotovelos e volte devagar.", video: "https://www.nhs.uk/live-well/exercise/strength-and-flex-exercise-plan-how-to-videos/" },
  { id: "sit-to-stand", equipment: "home_workout", group: "lower", name: "Sentar e levantar da cadeira", cue: "Use uma cadeira firme. Levante mantendo os pés no chão e sente devagar.", guide: nhs },
  { id: "calf-raise", equipment: "home_workout", group: "lower", name: "Elevação de panturrilha com apoio", cue: "Apoie as mãos numa superfície firme e suba na ponta dos pés. Desça com controle.", guide: nhs },
  { id: "curl", equipment: "dumbbells", group: "upper", name: "Rosca com halteres", cue: "Mantenha os cotovelos próximos ao corpo. Suba e desça o peso lentamente.", guide: nhs },
  { id: "band-row", equipment: "resistance_bands", group: "upper", name: "Remada com elástico", cue: "Com o elástico firme, puxe os cotovelos para trás e retorne devagar." },
  { id: "walk", equipment: "walking", group: "cardio", name: "Caminhada leve", cue: "Caminhe em ritmo confortável, em que consiga conversar." },
  { id: "run", equipment: "running", group: "cardio", name: "Corrida leve", cue: "Comece em ritmo confortável e reduza o ritmo se precisar." },
  { id: "bike", equipment: "cycling", group: "cardio", name: "Pedalada leve", cue: "Mantenha um ritmo confortável e ajuste a resistência antes de acelerar." },
  { id: "mobility", equipment: "yoga", group: "mobility", name: "Mobilidade leve de ombros", cue: "Mova os ombros lentamente em uma amplitude confortável, sem forçar." },
] as const;

function isExcluded(name: string, excluded: string[]) {
  const key = exerciseKey(name);
  return excluded.some((item) => {
    const term = exerciseKey(item);
    return term && (key.includes(term) || term.includes(key));
  });
}

function exercisesFor(group: Group, preferences: Preferences): ExerciseDetail[] {
  const equipment = preferences.available_equipment ?? [];
  const excluded = preferences.excluded_exercises ?? [];
  return catalog.flatMap((exercise) => {
    if (exercise.group !== group || !equipment.some((value) => value === exercise.equipment) ||
      isExcluded(exercise.name, excluded) || isExcluded(titles[group], excluded)) return [];
    const strength = group === "upper" || group === "lower";
    return [{
      name: exercise.name, group: titles[group], sets: 1,
      reps: strength ? "8 a 12 repetições" : "Ritmo confortável",
      duration: null, instructions: exercise.cue,
    }];
  });
}

export function exerciseDemonstration(name: string) {
  const key = exerciseKey(name);
  const exercise = catalog.find((item) => exerciseKey(item.name) === key);
  if (exercise && "video" in exercise) return { url: exercise.video, label: "Ver vídeo demonstrativo" };
  if (exercise && "guide" in exercise) return { url: exercise.guide, label: "Ver guia com fotos" };
  return null;
}

export function buildExerciseSchedule(preferences: Preferences): ExerciseSchedule {
  const upper = exercisesFor("upper", preferences);
  const lower = exercisesFor("lower", preferences);
  const cardio = exercisesFor("cardio", preferences);
  const mobility = exercisesFor("mobility", preferences);
  return {
    Segunda: upper, Terça: lower, Quarta: [...cardio, ...mobility], Quinta: [],
    Sexta: [...upper, ...lower], Sábado: cardio, Domingo: [],
  };
}

export function expandSavedStrengthBlocks(schedule: ExerciseSchedule | null, preferences: Preferences): ExerciseSchedule | null {
  if (!schedule) return null;
  return Object.fromEntries(Object.entries(schedule).map(([day, exercises]) => {
    if (!Array.isArray(exercises)) return [day, []];
    const seen = new Set<string>();
    const result = exercises.flatMap((exercise) => {
      const key = exerciseKey(exercise.name);
      if (isExcluded(exercise.name, preferences.excluded_exercises ?? [])) return [];
      const group = /^musculacao:\s*/.test(key)
        ? /inferiores|gluteos/.test(key) ? "lower" : /superiores|costas/.test(key) ? "upper" : null
        : null;
      return group ? exercisesFor(group, preferences) : [exercise];
    }).filter((exercise) => {
      const key = exerciseKey(exercise.name);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return [day, result];
  }));
}
