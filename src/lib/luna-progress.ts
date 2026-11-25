type Weight = { weight_kg: number; logged_at: string };
type Meal = { created_at: string };

const dateKey = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit",
});
const dateLabel = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit",
});
const kilos = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

export function summarizeProgress(weights: Weight[], meals: Meal[]) {
  const weightDays = new Map<string, Weight>();
  for (const entry of weights) {
    const weight = Number(entry.weight_kg);
    const time = new Date(entry.logged_at);
    if (!Number.isFinite(weight) || weight <= 0 || !Number.isFinite(time.getTime())) continue;
    const day = dateKey.format(time);
    const previous = weightDays.get(day);
    if (!previous || time.getTime() >= new Date(previous.logged_at).getTime()) {
      weightDays.set(day, { ...entry, weight_kg: weight });
    }
  }

  const ordered = Array.from(weightDays.entries()).sort(([a], [b]) => a.localeCompare(b));
  const first = ordered[0]?.[1];
  const last = ordered[ordered.length - 1]?.[1];
  const mealDays = new Set(meals.map(({ created_at }) => dateKey.format(new Date(created_at)))).size;
  const positives: string[] = [];
  const attention: string[] = [];

  if (mealDays) positives.push(`Você anotou ${meals.length} ${meals.length === 1 ? "refeição" : "refeições"} em ${mealDays} ${mealDays === 1 ? "dia" : "dias"} no diário.`);
  else attention.push("O diário não tem refeições neste período para eu comentar sobre sua rotina de registros.");

  if (ordered.length >= 2) {
    positives.push(`Há medições de peso em ${ordered.length} dias diferentes para acompanhar ao longo do tempo.`);
    attention.push("Compare medições feitas em condições parecidas. O peso pode oscilar, e essa diferença sozinha não indica ganho ou perda de gordura.");
  } else if (last) {
    attention.push("Só há peso registrado em um dia. Com medições em dias diferentes, posso mostrar a variação.");
  } else {
    attention.push("Ainda não há peso registrado no período.");
  }

  return {
    positives,
    attention,
    weight: first && last ? {
      first: kilos.format(first.weight_kg),
      last: kilos.format(last.weight_kg),
      firstDate: dateLabel.format(new Date(first.logged_at)),
      lastDate: dateLabel.format(new Date(last.logged_at)),
      change: ordered.length < 2 ? null : kilos.format(Math.abs(last.weight_kg - first.weight_kg)),
      direction: last.weight_kg < first.weight_kg ? "abaixo" : last.weight_kg > first.weight_kg ? "acima" : "igual",
    } : null,
  };
}

export type LunaProgress = ReturnType<typeof summarizeProgress>;
