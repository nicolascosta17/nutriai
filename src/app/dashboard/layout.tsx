import Navbar from "@/components/Navbar";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let userEmail: string | undefined;
  let userName: string | undefined;

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      userEmail = user.email;
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .maybeSingle();
      userName = profile?.name ?? undefined;
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50/70 text-zinc-900 font-sans flex flex-col">
      <Navbar userName={userName} userEmail={userEmail} />
      <main className="flex-1 w-full min-w-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="border-t border-zinc-200/80 bg-white py-6 mt-12 text-center text-xs text-zinc-500">
        <p>NutriAI Platform • Prescrição Nutricional & Periodização Física por Visão Computacional</p>
      </footer>
    </div>
  );
}
