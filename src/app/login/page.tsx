"use client";

import NutriLogo from "@/components/NutriLogo";
import { useState } from "react";
import Link from "next/link";
import AuthCallbackNotice from "@/components/AuthCallbackNotice";
import GoogleSignIn from "@/components/GoogleSignIn";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";
import { createClient, getAuthErrorMessage, isSupabaseConfigured } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const authConfigured = isSupabaseConfigured();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Preencha seu e-mail e senha.");
      return;
    }

    if (!authConfigured) {
      toast.error("Login indisponível: o serviço de autenticação ainda não está configurado neste site.");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        toast.error(getAuthErrorMessage(error, "login"));
        return;
      }

      if (!data.user) {
        toast.error("Não foi possível iniciar a sessão. Tente novamente.");
        return;
      }

      toast.success("Acesso autenticado com sucesso!");
      const { data: profile } = await supabase
        .from("profiles")
        .select("daily_calorie_target")
        .eq("id", data.user.id)
        .maybeSingle();
      router.replace(profile?.daily_calorie_target ? "/dashboard" : "/onboarding");
    } catch (error) {
      toast.error(getAuthErrorMessage(error, "login"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-zinc-50 border-t-2 border-emerald-600">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <NutriLogo className="h-10 w-10" />
          <span className="text-xl font-bold tracking-tight text-zinc-950">
            Nutri<span className="text-emerald-600">AI</span>
          </span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-950">
          Acesso ao Prontuário & Métricas
        </h2>
        <p className="mt-1.5 text-xs text-zinc-500">
          Entre com suas credenciais para visualizar sua ingestão calórica diária
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-xl border border-zinc-200/90 shadow-xs">
          <AuthCallbackNotice />
          <form onSubmit={handleLogin} className="space-y-4">
            {!authConfigured && (
              <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-left text-sm text-amber-900">
                Login indisponível: o serviço de contas ainda não foi configurado neste site.
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  required
                  className="block w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="auth-password" className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">
                  Senha
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="block w-full pl-9 pr-12 py-2.5 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 transition-colors"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  aria-controls="auth-password"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute inset-y-0 right-0 grid min-w-11 place-items-center rounded-r-lg text-zinc-500 hover:text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700"
                >
                  {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || !authConfigured}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-sm transition-all shadow-xs disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Autenticando...</span>
                  </>
                ) : (
                  <>
                    <span>Entrar no Painel</span>
                    <ArrowRight className="w-4 h-4 text-emerald-400" />
                  </>
                )}
              </button>
            </div>
          </form>

          <GoogleSignIn disabled={isLoading || !authConfigured} />

          <div className="mt-6 pt-6 border-t border-zinc-100 text-center">
            <p className="text-xs text-zinc-500">
              Ainda não possui prontuário clínico?{" "}
              <Link href="/register" className="font-semibold text-emerald-700 hover:text-emerald-800 underline underline-offset-4">
                Criar conta e iniciar anamnese
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
