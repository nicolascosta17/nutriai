"use client";

import ThemeToggle from "@/components/ThemeToggle";
import NutriLogo from "@/components/NutriLogo";
import { useState } from "react";
import Link from "next/link";
import GoogleSignIn from "@/components/GoogleSignIn";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, Loader2 } from "lucide-react";
import { createClient, getAuthErrorMessage, isSupabaseConfigured } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const authConfigured = isSupabaseConfigured();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      toast.error("Preencha todos os campos do cadastro.");
      return;
    }

    if (password.length < 8) {
      toast.error("A senha deve ter no mínimo 8 caracteres.");
      return;
    }

    if (!authConfigured) {
      toast.error("Cadastro indisponível: o serviço de autenticação ainda não está configurado neste site. Sua conta não foi criada.");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { name: name.trim() },
          emailRedirectTo: new URL("/auth/callback", window.location.origin).href,
        },
      });

      if (error) {
        toast.error(getAuthErrorMessage(error, "register"));
        return;
      }

      if (!data.session) {
        toast.success("Se for um novo cadastro, enviaremos um link de confirmação ao seu e-mail.");
        router.push("/login");
        return;
      }

      toast.success("Cadastro realizado! Vamos configurar suas métricas corporais.");
      router.push("/onboarding");
    } catch (error) {
      toast.error(getAuthErrorMessage(error, "register"));
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
          Cadastro de Perfil Clínico
        </h2>
        <p className="mt-1.5 text-xs text-zinc-500">
          Inicie sua avaliação nutricional e prescrição personalizada de emagrecimento
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-xl border border-zinc-200/90 shadow-xs">
          <form onSubmit={handleRegister} className="space-y-4">
            {!authConfigured && (
              <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-left text-sm text-amber-900">
                Cadastro indisponível: o serviço de contas ainda não foi configurado neste site. Sua conta não será criada até isso ser corrigido.
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1.5">
                Nome Completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  autoComplete="name"
                  maxLength={120}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dr. / Paciente João Silva"
                  required
                  className="block w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1.5">
                E-mail Institucional ou Pessoal
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
                  placeholder="joao@exemplo.com"
                  required
                  className="block w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1.5">
                Senha Segura
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
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
                    <span>Criando Prontuário...</span>
                  </>
                ) : (
                  <>
                    <span>Criar conta</span>
                    <ArrowRight className="w-4 h-4 text-emerald-400" />
                  </>
                )}
              </button>
            </div>
          </form>

          <GoogleSignIn disabled={isLoading || !authConfigured} />
          <div className="mt-4 flex justify-center"><ThemeToggle /></div>

          <div className="mt-6 pt-6 border-t border-zinc-100 text-center">
            <p className="text-xs text-zinc-500">
              Já possui conta cadastrada?{" "}
              <Link href="/login" className="font-semibold text-emerald-700 hover:text-emerald-800 underline underline-offset-4">
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
