import Navbar from "@/components/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50/70 text-zinc-900 font-sans flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="border-t border-zinc-200/80 bg-white py-6 mt-12 text-center text-xs text-zinc-500">
        <p>NutriAI Platform • Prescrição Nutricional & Periodização Física por Visão Computacional</p>
      </footer>
    </div>
  );
}
