"use client";

import { useState } from "react";
import { createClient, getAuthErrorMessage } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function GoogleSignIn({ disabled }: { disabled: boolean }) {
  const [isRedirecting, setIsRedirecting] = useState(false);

  if (process.env.NEXT_PUBLIC_GOOGLE_SIGN_IN !== "true") return null;

  async function signIn() {
    setIsRedirecting(true);

    try {
      const { error } = await createClient().auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: new URL("/auth/callback", window.location.origin).href,
        },
      });

      if (error) throw error;
    } catch (error) {
      setIsRedirecting(false);
      toast.error(getAuthErrorMessage(error, "google"));
    }
  }

  return (
    <button
      type="button"
      onClick={signIn}
      disabled={disabled || isRedirecting}
      className="mt-4 min-h-11 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 disabled:opacity-60"
    >
      {isRedirecting ? "Abrindo o Google…" : "Entrar com Google"}
    </button>
  );
}
