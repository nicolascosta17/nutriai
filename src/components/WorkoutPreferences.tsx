"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { workoutOptions } from "@/lib/workout-preferences";

export default function WorkoutPreferences({ equipment, excluded }: { equipment: string[]; excluded: string[] }) {
  const [selected, setSelected] = useState(equipment);
  const [avoid, setAvoid] = useState(excluded.join("\n"));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setFailed(false);
    try {
      const response = await fetch("/api/workout-preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ equipment: selected, excluded: avoid.split(/\n/).map((item) => item.trim()).filter(Boolean) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setMessage("Preferências salvas. Abra Treinos e toque em Adaptar treino para aplicar ao plano.");
    } catch (error) {
      setFailed(true);
      setMessage(error instanceof Error && error.message ? error.message : "Não foi possível salvar. Tente de novo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5">
      <h2 className="font-semibold">Preferências de treino</h2>
      <fieldset disabled={busy}>
        <legend className="mb-2 text-sm font-medium">Onde você treina e o que tem disponível?</legend>
        <div className="grid gap-1 sm:grid-cols-2">
          {workoutOptions.map(({ id, label }) => (
            <label key={id} className="flex min-h-11 items-center gap-2 text-sm">
              <input type="checkbox" className="h-4 w-4 accent-emerald-700" checked={selected.includes(id)}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setSelected((current) => checked ? [...current, id] : current.filter((item) => item !== id));
                }} />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="space-y-1">
        <label htmlFor="excluded-exercises" className="block text-sm font-medium">Exercícios que quero evitar</label>
        <p id="exercise-hint" className="text-xs text-zinc-600">Escreva um por linha. Exemplo: leg press.</p>
        <textarea id="excluded-exercises" aria-describedby="exercise-hint" rows={4} maxLength={1500} disabled={busy}
          className="w-full rounded-lg border border-zinc-300 p-3" value={avoid} onChange={(event) => setAvoid(event.target.value)} />
      </div>
      {message && <p role={failed ? "alert" : "status"} className="text-sm">{message}</p>}
      <div className="flex flex-wrap items-center gap-4">
        <button disabled={busy} className="min-h-11 rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white disabled:opacity-60">
          {busy ? "Salvando…" : "Salvar preferências"}
        </button>
        <Link href="/dashboard/exercise" className="text-sm font-semibold text-emerald-700 underline">Abrir treinos</Link>
      </div>
    </form>
  );
}
