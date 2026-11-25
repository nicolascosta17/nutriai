import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured() {
  const url = supabaseUrl?.toLowerCase() ?? "";
  const key = supabaseAnonKey?.toLowerCase() ?? "";

  return Boolean(
    url &&
      key &&
      !url.includes("placeholder") &&
      !url.includes("your_supabase") &&
      !key.includes("placeholder") &&
      !key.includes("your_supabase")
  );
}

export function getAuthErrorMessage(
  error: unknown,
  action: "login" | "register"
) {
  const message =
    error && typeof error === "object" && "message" in error
      ? String((error as { message?: unknown }).message ?? "")
      : String(error ?? "");
  const normalized = message.toLowerCase();

  if (
    normalized.includes("failed to fetch") ||
    normalized.includes("fetch failed") ||
    normalized.includes("networkerror") ||
    normalized.includes("network request failed")
  ) {
    return "Não foi possível conectar ao serviço de autenticação. Verifique sua internet e tente novamente.";
  }

  if (
    normalized.includes("user already registered") ||
    normalized.includes("already registered")
  ) {
    return "Já existe uma conta com este e-mail. Faça login ou recupere sua senha.";
  }

  if (normalized.includes("invalid login credentials")) {
    return "E-mail ou senha incorretos. Confira os dados e tente novamente.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.";
  }

  if (
    normalized.includes("password should be at least") ||
    normalized.includes("password is too short")
  ) {
    return "A senha precisa ter pelo menos 6 caracteres.";
  }

  if (normalized.includes("invalid email")) {
    return "Digite um endereço de e-mail válido.";
  }

  if (
    normalized.includes("too many requests") ||
    normalized.includes("rate limit")
  ) {
    return "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.";
  }

  return action === "register"
    ? "Não foi possível criar sua conta. Revise os dados e tente novamente."
    : "Não foi possível entrar. Confira suas credenciais e tente novamente.";
}

export function createClient() {
  return createBrowserClient(
    supabaseUrl || "https://placeholder.supabase.co",
    supabaseAnonKey || "placeholder-anon-key"
  );
}
