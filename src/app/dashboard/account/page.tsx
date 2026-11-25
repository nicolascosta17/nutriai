import Link from "next/link";
import { redirect } from "next/navigation";
import AccountSettings from "@/components/AccountSettings";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { createClient } from "@/lib/supabase/server";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: { confirmation?: string };
}) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-xl space-y-3">
        <h1 className="text-2xl font-bold">Minha conta</h1>
        <p>O serviço de contas ainda não está disponível.</p>
        <Link href="/dashboard" className="font-medium text-emerald-700">Voltar ao painel</Link>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .maybeSingle();

  const accountName = user.user_metadata.name ?? user.user_metadata.full_name;
  const name = profile?.name ?? (typeof accountName === "string" ? accountName : "");
  const confirmation = searchParams.confirmation;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-zinc-950">Minha conta</h1>
      {confirmation === "received" && (
        <p role="status" className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-900">
          Confirmação recebida. Se a mudança ainda estiver pendente, confira os links enviados ao endereço atual e ao novo.
        </p>
      )}
      {confirmation === "failed" && (
        <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
          O link é inválido ou expirou. Solicite a alteração de e-mail novamente.
        </p>
      )}
      <AccountSettings userId={user.id} name={name} email={user.email ?? ""} />
    </div>
  );
}
