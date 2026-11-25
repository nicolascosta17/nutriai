"use client";

import type { LunaProgress } from "@/lib/luna-progress";
import { useState, type FormEvent } from "react";

type Message = { role: "user" | "model"; text: string };

export default function NutritionChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [progress, setProgress] = useState<LunaProgress | null>(null);
  const [progressBusy, setProgressBusy] = useState(false);
  const [progressError, setProgressError] = useState("");

  async function analyzeProgress() {
    setProgressBusy(true);
    setProgressError("");
    try {
      const response = await fetch("/api/nutrition-chat/progress", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setProgress(data.progress);
    } catch (failure) {
      setProgressError(failure instanceof Error && failure.message ? failure.message : "Não foi possível analisar sua evolução.");
    } finally {
      setProgressBusy(false);
    }
  }

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = question.trim();
    if (!text || busy) return;
    setError("");
    setBusy(true);
    const next: Message[] = [...messages, { role: "user", text }];
    try {
      const response = await fetch("/api/nutrition-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(-9).map((item) => ({ ...item, text: item.text.slice(0, 3500) })) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível enviar a pergunta.");
      setMessages([...next, { role: "model", text: data.answer }]);
      setQuestion("");
    } catch (failure) {
      setError(failure instanceof Error && failure.message ? failure.message : "Não foi possível enviar a pergunta.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-2xl space-y-5">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-zinc-950">Luna</h1>
        <p className="text-sm text-zinc-700">
          Acompanhe seus registros e tire dúvidas sobre alimentação. As orientações são educativas e não substituem consulta.
        </p>
        <p className="text-xs text-zinc-600">
          As mensagens são enviadas ao Google Gemini para gerar respostas. Evite incluir dados pessoais, exames ou informações de saúde.
        </p>
      </header>
      <section className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4" aria-labelledby="luna-progress">
        <div>
          <h2 id="luna-progress" className="font-semibold text-zinc-950">Sua evolução nos últimos 30 dias</h2>
          <p className="mt-1 text-sm text-zinc-600">A Luna resume seu histórico de peso e de refeições. Seus registros não são enviados ao Gemini nesta análise.</p>
        </div>
        <button type="button" onClick={analyzeProgress} disabled={progressBusy}
          className="min-h-11 rounded-lg border border-zinc-300 px-4 text-sm font-semibold text-zinc-900 disabled:opacity-60">
          {progressBusy ? "Analisando…" : progress ? "Atualizar análise" : "Analisar minha evolução"}
        </button>
        {progressError && <p role="alert" className="text-sm text-red-700">{progressError}</p>}
        {progress && (
          <div aria-live="polite" className="space-y-4 text-sm text-zinc-700">
            {progress.weight && (
              <p>
                {progress.weight.change === null ? `${progress.weight.last} kg registrados em ${progress.weight.lastDate}.` :
                  `Peso registrado: ${progress.weight.first} kg em ${progress.weight.firstDate} → ${progress.weight.last} kg em ${progress.weight.lastDate}.`}
                {progress.weight.change !== null && (
                  <> {progress.weight.direction === "igual" ? "Os dois registros têm o mesmo valor." : `O último ficou ${progress.weight.change} kg ${progress.weight.direction} do primeiro.`}</>
                )}
              </p>
            )}
            {progress.positives.length > 0 && (
              <div>
                <h3 className="font-semibold text-emerald-700">Pontos positivos</h3>
                <ul className="mt-1 list-disc space-y-1 pl-5">{progress.positives.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            )}
            <div>
              <h3 className="font-semibold text-amber-800">Pontos de atenção</h3>
              <ul className="mt-1 list-disc space-y-1 pl-5">{progress.attention.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </div>
        )}
      </section>
      <div role="log" aria-label="Conversa" className="space-y-3">
        {messages.map((message, index) => (
          <article key={index} className={message.role === "user" ? "ml-auto max-w-[90%] rounded-xl border border-emerald-200 bg-emerald-50 p-4" : "max-w-[95%] rounded-xl border border-zinc-200 bg-white p-4"}>
            <h2 className="mb-1 text-xs font-semibold text-zinc-700">{message.role === "user" ? "Você" : "Luna"}</h2>
            <p className="whitespace-pre-wrap break-words text-sm text-zinc-900">{message.text}</p>
          </article>
        ))}
      </div>
      <form onSubmit={send} className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4">
        <label htmlFor="nutrition-question" className="block text-sm font-medium">Sua pergunta</label>
        <textarea id="nutrition-question" rows={3} required maxLength={1500} disabled={busy}
          placeholder="Ex.: Como comparar a quantidade de açúcar nos rótulos?"
          className="w-full rounded-lg border border-zinc-300 p-3" value={question} onChange={(event) => setQuestion(event.target.value)} />
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={busy || !question.trim()} className="min-h-11 rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white disabled:opacity-60">
          {busy ? "Preparando resposta…" : "Enviar pergunta"}
        </button>
      </form>
    </section>
  );
}
