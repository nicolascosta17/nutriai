"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { parseTrainingAnswers, trainingDays, trainingQuestions, type TrainingAnswers } from "@/lib/training-assessment";

export default function TrainingQuestionnaire({
  initial, onSave, onCancel,
}: {
  initial: TrainingAnswers | null;
  onSave: (answers: TrainingAnswers) => Promise<void>;
  onCancel?: () => void;
}) {
  const [step, setStep] = useState(0);
  const [days, setDays] = useState<string[]>(initial?.days ?? []);
  const [choices, setChoices] = useState<Partial<Omit<TrainingAnswers, "days">>>(initial ?? {});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const question = trainingQuestions[step - 1];
  const total = trainingQuestions.length + 1;

  async function next(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step < total - 1) {
      setStep(step + 1);
      return;
    }
    const answers = parseTrainingAnswers({ ...choices, days });
    if (!answers) return;
    setBusy(true);
    setError("");
    try {
      await onSave(answers);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Não foi possível salvar as respostas.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={next} className="mx-auto max-w-xl space-y-5 rounded-xl border border-zinc-200 bg-white p-5 sm:p-7">
      <div>
        <p className="text-xs font-semibold text-emerald-700">Etapa {step + 1} de {total}</p>
        <h1 className="mt-1 text-2xl font-bold text-zinc-950">Monte seu treino</h1>
        <p className="mt-2 text-sm text-zinc-600">Responda pelo que você já consegue fazer com conforto. Não precisa testar os movimentos agora.</p>
      </div>
      <fieldset key={step} className="space-y-2" disabled={busy}>
        <legend className="mb-2 text-base font-semibold text-zinc-950">{question?.question ?? "Em quais dias você consegue treinar de verdade?"}</legend>
        {question ? question.choices.map(([value, label]) => (
          <label key={value} className="flex min-h-11 items-center gap-3 rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800">
            <input className="h-4 w-4 shrink-0 accent-emerald-700" type="radio" name={question.key} value={value}
              checked={choices[question.key] === value}
              onChange={() => setChoices((previous) => ({ ...previous, [question.key]: value }))} />
            {label}
          </label>
        )) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {trainingDays.map((day) => (
              <label key={day} className="flex min-h-11 items-center gap-2 rounded-lg border border-zinc-200 px-3 text-sm text-zinc-800">
                <input className="h-4 w-4 shrink-0 accent-emerald-700" type="checkbox" checked={days.includes(day)}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    setDays((previous) => checked ? [...previous, day] : previous.filter((item) => item !== day));
                  }} />
                {day}
              </label>
            ))}
          </div>
        )}
      </fieldset>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <div className="flex flex-wrap items-center gap-3">
        {step > 0 && <button type="button" disabled={busy} onClick={() => setStep(step - 1)} className="min-h-11 rounded-lg border border-zinc-300 px-4 text-sm">Voltar</button>}
        <button type="submit" disabled={busy || (question ? !choices[question.key] : !days.length)}
          className="min-h-11 rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white disabled:opacity-60">
          {busy ? "Salvando…" : step === total - 1 ? "Salvar e montar meu treino" : "Continuar"}
        </button>
        {onCancel && <button type="button" disabled={busy} onClick={onCancel} className="min-h-11 px-2 text-sm underline">Cancelar</button>}
      </div>
      <Link href="/dashboard/account" className="inline-block text-sm font-medium text-emerald-700 underline">Conferir meus equipamentos</Link>
    </form>
  );
}
