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
  action: "login" | "register" | "google" | "account"
) {
  const message =
    error && typeof error === "object" && "message" in error
      ? String((error as { message?: unknown }).message ?? "")
      : String(error ?? "");
  const normalized = message.toLowerCase();
  const code = error && typeof error === "object" && "code" in error ? error.code : undefined;

  if (code === "email_address_not_authorized" || normalized.includes("error sending")) {
    return "O serviço não conseguiu enviar o e-mail de confirmação. Tente novamente mais tarde.";
  }

  if (code === "email_exists" || code === "user_already_exists") {
    return "Este e-mail já está associado a uma conta.";
  }

  if (code === "same_password") {
    return "Escolha uma senha diferente da atual.";
  }

  if (code === "reauthentication_not_valid") {
    return "O código de confirmação expirou ou está incorreto. Solicite um novo código.";
  }

  if (code === "weak_password") {
    return "Escolha uma senha mais forte.";
  }

  if (
    normalized.includes("failed to fetch") ||
    normalized.includes("fetch failed") ||
    normalized.includes("networkerror") ||
    normalized.includes("load failed") ||
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

  if (code === "invalid_credentials" || normalized.includes("invalid login credentials")) {
    return "E-mail ou senha incorretos. Confira os dados e tente novamente.";
  }

  if (code === "email_not_confirmed" || normalized.includes("email not confirmed")) {
    return "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.";
  }

  if (
    normalized.includes("password should be at least") ||
    normalized.includes("password is too short")
  ) {
    return "A senha informada é curta demais. Use pelo menos 8 caracteres.";
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

  const fallback = {
    login: "Não foi possível entrar. Confira suas credenciais e tente novamente.",
    register: "Não foi possível criar sua conta. Revise os dados e tente novamente.",
    google: "Não foi possível iniciar a entrada com Google. Tente novamente.",
    account: "Não foi possível salvar a alteração. Tente novamente.",
  };

  return fallback[action];
}

export function createClient() {
  return createBrowserClient(
    supabaseUrl || "https://placeholder.supabase.co",
    supabaseAnonKey || "placeholder-anon-key"
  );
}
