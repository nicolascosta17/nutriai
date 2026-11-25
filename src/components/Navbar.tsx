"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Activity, 
  Menu, 
  X, 
  LogOut, 
  LayoutDashboard, 
  UtensilsCrossed, 
  FileText, 
  Dumbbell, 
  User, 
  ChevronRight 
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface NavLink {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navLinks: NavLink[] = [
  { href: "/dashboard", label: "Painel Geral", icon: LayoutDashboard },
  { href: "/dashboard/food", label: "Diário Alimentar", icon: UtensilsCrossed },
  { href: "/dashboard/diet", label: "Plano Nutricional", icon: FileText },
  { href: "/dashboard/exercise", label: "Periodização de Treino", icon: Dumbbell },
  { href: "/dashboard/profile", label: "Metabólico & Metas", icon: User },
];

interface NavbarProps {
  userEmail?: string;
  userName?: string;
}

export default function Navbar({ userEmail, userName }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Não foi possível encerrar a sessão.");
      return;
    }
    toast.success("Sessão finalizada com sucesso.");
    router.push("/login");
  };

  return (
    <header className="app-safe-area-top sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/95 backdrop-blur-md">
      <div className="app-safe-area-horizontal mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-6">
          {/* Logo & Clinical Brand */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90 focus:outline-none"
            aria-label="NutriAI - Plataforma Nutricional"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-emerald-400 shadow-sm">
              <Activity className="h-5 w-5" strokeWidth={2.2} />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold tracking-tight text-zinc-950 font-sans">
                Nutri<span className="text-emerald-600">AI</span>
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                Clinical Precision
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1.5" aria-label="Navegação Principal">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-md transition-all ${
                    active
                      ? "bg-zinc-900 text-white shadow-sm"
                      : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className={`h-3.5 w-3.5 ${active ? "text-emerald-400" : "text-zinc-400"}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Actions */}
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-2.5 pl-2 border-l border-zinc-200">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-700">
                {userName ? userName.slice(0, 2).toUpperCase() : "NT"}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-medium text-zinc-900 leading-none">
                  {userName || "Paciente"}
                </span>
                <span className="text-[11px] text-zinc-500 leading-tight truncate max-w-[140px]">
                  {userEmail || "paciente@nutriai.com"}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-red-50 hover:text-red-700 transition-colors border border-transparent hover:border-red-100"
              title="Encerrar sessão"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Sair</span>
            </button>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none"
              aria-expanded={mobileOpen}
              aria-label="Abrir menu de navegação"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-zinc-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
          <div className="px-3 py-2 border-b border-zinc-100 mb-2">
            <p className="text-xs font-semibold text-zinc-900">{userName || "Paciente Ativo"}</p>
            <p className="text-[11px] text-zinc-500">{userEmail}</p>
          </div>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${active ? "text-emerald-400" : "text-zinc-400"}`} />
                  <span>{link.label}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-400 opacity-60" />
              </Link>
            );
          })}
          <div className="pt-2 border-t border-zinc-100">
            <button
              onClick={() => {
                setMobileOpen(false);
                handleLogout();
              }}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Encerrar Sessão</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}