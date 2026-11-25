import ThemeToggle from "@/components/ThemeToggle";
import NutriLogo from "@/components/NutriLogo";
import Link from "next/link";
import { 
  Camera, 
  Sparkles, 
  Dumbbell, 
  TrendingDown, 
  ShieldCheck, 
  Check, 
  ArrowRight, 
  Target, 
  Zap, 
  Scale, 
  PieChart as PieChartIcon 
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Header */}
      <header className="app-safe-area-top sticky z-50 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <NutriLogo className="h-9 w-9" />
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-zinc-950">
                Nutri<span className="text-emerald-600">AI</span>
              </span>
              <span className="hidden sm:block text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                Clinical Precision
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-zinc-600">
            <a href="#solucao" className="hover:text-zinc-950 transition-colors">Visão Computacional</a>
            <a href="#metodologia" className="hover:text-zinc-950 transition-colors">Metodologia Científica</a>
            <a href="#treino" className="hover:text-zinc-950 transition-colors">Treino & Adaptação</a>
          </nav>

          <div className="flex shrink-0 items-center gap-1 sm:gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="whitespace-nowrap px-2 py-2 text-[11px] font-semibold text-zinc-700 transition-colors hover:text-zinc-950 sm:px-3 sm:text-xs"
            >
              Acessar Conta
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-3.5 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition-colors shadow-xs"
            >
              <span className="sm:hidden">Começar</span>
              <span className="hidden sm:inline">Iniciar Avaliação</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32 border-b border-zinc-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex max-w-full items-start gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3.5 py-1 text-left text-xs font-medium leading-relaxed text-zinc-700 mb-6 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              <span>Inteligência Artificial Aplicada à Nutrição e Biomecânica</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-950 leading-[1.12]">
              Prescrição nutricional guiada por visão computacional e biometria.
            </h1>

            <p className="mt-6 text-base sm:text-lg text-zinc-600 leading-relaxed max-w-2xl mx-auto">
              Fotografe suas refeições para decomposição volumétrica instantânea de calorias e macronutrientes. 
              Estruture seu déficit calórico e sincronize periodizações de treino adaptadas à sua rotina real.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 transition-all"
              >
                <span>Calcular Meu Déficit & Dieta</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-6 py-3.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                <span>Explorar Painel Demonstrativo</span>
              </Link>
            </div>

            {/* Credibility metrics */}
            <div className="mt-16 grid grid-cols-1 min-[380px]:grid-cols-2 sm:grid-cols-4 gap-5 sm:gap-6 border-t border-zinc-100 pt-10 text-left">
              <div>
                <p className="text-lg sm:text-2xl font-bold text-zinc-950 font-mono tracking-tight break-words">Mifflin-St Jeor</p>
                <p className="text-xs text-zinc-500 mt-0.5">Equação metabólica de referência</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-950 font-mono tracking-tight">Foto-análise</p>
                <p className="text-xs text-zinc-500 mt-0.5">Reconhecimento fotométrico de macros</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-950 font-mono tracking-tight">4 Modalidades</p>
                <p className="text-xs text-zinc-500 mt-0.5">Academia, corrida, bike e caminhada</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-950 font-mono tracking-tight">100% Adaptativo</p>
                <p className="text-xs text-zinc-500 mt-0.5">Ajuste semanal baseado em balanço</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Deep Dive */}
      <section id="solucao" className="py-24 bg-zinc-50/60 border-b border-zinc-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Protocolo Tecnológico
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-950 mt-2">
              Precisão analítica em três dimensões fisiológicas
            </h2>
            <p className="text-sm text-zinc-600 mt-3 leading-relaxed">
              Elimine estimativas imprecisas em cadernos de dieta. Nossa arquitetura une modelos multimodais de visão computacional a cálculos de gasto energético e periodização física.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded-xl border border-zinc-200/80 p-8 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-zinc-900 text-emerald-400 flex items-center justify-center mb-6">
                  <Camera className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-950 tracking-tight">
                  1. Registro Fotográfico Inteligente
                </h3>
                <p className="text-sm text-zinc-600 mt-2.5 leading-relaxed">
                  Basta apontar a câmera para o prato. A IA segmenta os ingredientes, estima o peso por densidade volumétrica e computa calorias, proteínas, carboidratos e lipídios em segundos.
                </p>
              </div>
              <ul className="mt-6 pt-6 border-t border-zinc-100 space-y-2 text-xs text-zinc-600">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Decomposição imediata de macronutrientes
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Alerta sobre excesso de sódio e ultraprocessados
                </li>
              </ul>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-xl border border-zinc-200/80 p-8 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-zinc-900 text-emerald-400 flex items-center justify-center mb-6">
                  <Scale className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-950 tracking-tight">
                  2. Prescrição Dietética Personalizada
                </h3>
                <p className="text-sm text-zinc-600 mt-2.5 leading-relaxed">
                  Com base na sua altura, peso atual, idade e meta de emagrecimento, calculamos a TMB e geramos um plano alimentar fracionado com déficit calórico sustentável e seguro.
                </p>
              </div>
              <ul className="mt-6 pt-6 border-t border-zinc-100 space-y-2 text-xs text-zinc-600">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Déficit calórico calculado sem catabolismo
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Cardápio fracionado em 4 a 5 refeições práticas
                </li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-xl border border-zinc-200/80 p-8 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-zinc-900 text-emerald-400 flex items-center justify-center mb-6">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-950 tracking-tight">
                  3. Periodização de Exercícios Adaptada
                </h3>
                <p className="text-sm text-zinc-600 mt-2.5 leading-relaxed">
                  O aplicativo intercala treinos com o que você realmente tem disponível: academia tradicional, corrida de rua, ciclismo, caminhadas ou treinos em casa com peso corporal.
                </p>
              </div>
              <ul className="mt-6 pt-6 border-t border-zinc-100 space-y-2 text-xs text-zinc-600">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Divisão semanal adaptada ao seu equipamento
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Integração entre gasto calórico e saldo diário
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="py-20 bg-zinc-950 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Assuma o controle metabólico da sua rotina hoje.
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              Crie seu perfil clínico, insira seu peso e objetivo, e tenha em mãos um assistente nutricional de alta precisão 24 horas por dia.
            </p>
            <div className="pt-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-7 py-3.5 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors shadow-sm"
              >
                <span>Iniciar Minha Avaliação Gratuita</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-10 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <NutriLogo className="h-6 w-6 rounded" />
            <span className="font-semibold text-zinc-900">NutriAI Platform</span>
            <span>— Avaliação Nutricional Computacional</span>
          </div>
          <p>© {new Date().getFullYear()} NutriAI Inc. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
