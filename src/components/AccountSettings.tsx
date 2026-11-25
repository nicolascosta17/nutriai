"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient, getAuthErrorMessage } from "@/lib/supabase/client";

const sectionClass = "space-y-3 rounded-xl border border-zinc-200 bg-white p-5";
const inputClass = "block w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm";
const buttonClass = "min-h-11 rounded-lg bg-zinc-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60";

export default function AccountSettings({
  userId,
  name,
  email,
}: {
  userId: string;
  name: string;
  email: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [requiresCode, setRequiresCode] = useState(false);

  async function saveName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const newName = String(new FormData(event.currentTarget).get("name") ?? "").trim();
    if (!newName) {
      toast.error("Digite o nome que deseja usar no app.");
      return;
    }

    setPending(true);
    try {
      const { data, error } = await createClient()
        .from("profiles")
        .update({ name: newName })
        .eq("id", userId)
        .select("id")
        .single();
      if (error) throw error;
      if (!data) throw new Error("Profile not found");

      toast.success("Nome atualizado.");
      router.refresh();
    } catch (error) {
      toast.error(getAuthErrorMessage(error, "account"));
    } finally {
      setPending(false);
    }
  }

  async function changeEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const newEmail = String(new FormData(form).get("email") ?? "").trim();
    if (newEmail.toLowerCase() === email.toLowerCase()) {
      toast.error("Digite um e-mail diferente do atual.");
      return;
    }

    setPending(true);
    try {
      const { data, error } = await createClient().auth.updateUser(
        { email: newEmail },
        { emailRedirectTo: new URL("/auth/callback?flow=email_change", window.location.origin).href }
      );
      if (error) throw error;

      if (data.user?.email?.toLowerCase() === newEmail.toLowerCase()) {
        toast.success("E-mail atualizado.");
        router.refresh();
      } else {
        toast.success("Confira os links de confirmação enviados para seu e-mail atual e para o novo.");
      }
      form.reset();
    } catch (error) {
      toast.error(getAuthErrorMessage(error, "account"));
    } finally {
      setPending(false);
    }
  }

  async function sendPasswordCode() {
    setPending(true);
    try {
      const { error } = await createClient().auth.reauthenticate();
      if (error) throw error;
      toast.success("Confira o código de confirmação enviado ao seu e-mail.");
    } catch (error) {
      toast.error(getAuthErrorMessage(error, "account"));
    } finally {
      setPending(false);
    }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const password = String(fields.get("password") ?? "");
    const nonce = String(fields.get("nonce") ?? "").trim();
    if (password !== fields.get("confirmPassword")) {
      toast.error("As duas senhas precisam ser iguais.");
      return;
    }

    setPending(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser(nonce ? { password, nonce } : { password });
      if (error?.code === "reauthentication_needed") {
        setRequiresCode(true);
        const { error: sendError } = await supabase.auth.reauthenticate();
        if (sendError) throw sendError;
        toast.info("Enviamos um código para confirmar a troca de senha.");
        return;
      }
      if (error) throw error;

      form.reset();
      setRequiresCode(false);
      toast.success("Senha atualizada.");
    } catch (error) {
      toast.error(getAuthErrorMessage(error, "account"));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={saveName} className={sectionClass}>
        <h2 className="text-base font-semibold">Nome no aplicativo</h2>
        <label htmlFor="account-name" className="block text-sm">Nome completo</label>
        <input id="account-name" name="name" defaultValue={name} autoComplete="name" maxLength={120} required className={inputClass} />
        <button disabled={pending} className={buttonClass}>Salvar nome</button>
      </form>

      <form onSubmit={changeEmail} className={sectionClass}>
        <h2 className="text-base font-semibold">E-mail de acesso</h2>
        <p className="break-all text-sm text-zinc-600">{email}</p>
        <label htmlFor="account-email" className="block text-sm">Novo e-mail</label>
        <input id="account-email" name="email" type="email" autoComplete="email" required className={inputClass} />
        <p className="text-sm text-zinc-600">A alteração exige confirmação por e-mail.</p>
        <button disabled={pending} className={buttonClass}>Solicitar alteração</button>
      </form>

      <form onSubmit={changePassword} className={sectionClass}>
        <h2 className="text-base font-semibold">Senha</h2>
        <label htmlFor="account-password" className="block text-sm">Nova senha</label>
        <input id="account-password" name="password" type="password" autoComplete="new-password" minLength={8} required className={inputClass} />
        <label htmlFor="account-confirm" className="block text-sm">Confirme a nova senha</label>
        <input id="account-confirm" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required className={inputClass} />
        {requiresCode && (
          <>
            <label htmlFor="account-code" className="block text-sm">Código de confirmação enviado por e-mail</label>
            <input id="account-code" name="nonce" autoComplete="one-time-code" inputMode="numeric" required className={inputClass} />
            <button type="button" onClick={sendPasswordCode} disabled={pending} className="block min-h-11 text-sm font-medium text-emerald-700 disabled:opacity-60">
              Reenviar código
            </button>
          </>
        )}
        <button disabled={pending} className={buttonClass}>Salvar senha</button>
      </form>
    </div>
  );
}
