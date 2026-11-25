"use client";

import { useState, type FormEvent } from "react";

type Message = { role: "user" | "model"; text: string };

export default function NutritionChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

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
        <h1 className="text-2xl font-bold text-zinc-950">Chat de nutrição</h1>
        <p className="text-sm text-zinc-700">
          Tire dúvidas sobre alimentação, rótulos e preparo de refeições. As respostas são educativas e não substituem consulta.
        </p>
        <p className="text-xs text-zinc-600">
          As mensagens são enviadas ao Google Gemini para gerar respostas. Evite incluir dados pessoais, exames ou informações de saúde.
        </p>
      </header>
      <div role="log" aria-label="Conversa" className="space-y-3">
        {messages.map((message, index) => (
          <article key={index} className={message.role === "user" ? "ml-auto max-w-[90%] rounded-xl border border-emerald-200 bg-emerald-50 p-4" : "max-w-[95%] rounded-xl border border-zinc-200 bg-white p-4"}>
            <h2 className="mb-1 text-xs font-semibold text-zinc-700">{message.role === "user" ? "Você" : "NutriAI"}</h2>
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
