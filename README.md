# NutriAI — Plataforma Especialista em Nutrição & Biomecânica Clínica

NutriAI é uma aplicação full-stack desenvolvida com **Next.js 14**, **React 18**, **Tailwind CSS**, **Google Gemini 2.0 Flash** e **Supabase**.

Projetada com uma abordagem clínica, técnica e de alto padrão (SaaS de saúde moderna), eliminando elementos visuais infantis e priorizando precisão antropométrica, visão computacional fotométrica de alimentos e periodização inteligente de exercícios.

---

## 🌟 Principais Recursos

1. **Visão Computacional Nutricional (Foto-análise com IA)**
   - Upload fotográfico direto do prato (câmera ou arquivo).
   - Reconhecimento e segmentação de ingredientes.
   - Estimativa volumétrica e cálculo imediato de calorias totais, proteínas, carboidratos, lipídios, fibras e sódio.
   - Parecer clínico nutricional emitido pelo Gemini Flash 2.0.

2. **Cálculo Metabólico de Precisão (Mifflin-St Jeor)**
   - Taxa Metabólica Basal (TMB).
   - Gasto Energético Diário Total (TDEE) ajustado ao fator de atividade do usuário.
   - Déficit calórico estruturado (-500 kcal/dia) para emagrecimento sustentável e preservação muscular, ou superávit anabólico conforme meta.

3. **Prescrição Dietética Personalizada (Cardápio)**
   - Plano alimentar fracionado em 4 a 5 refeições diárias (Desjejum, Almoço, Fracionamento da Tarde, Jantar).
   - Alocação equilibrada de macronutrientes por refeição com foco em densidade nutricional e saciedade.
   - Capacidade de regenerar ou recalibrar a dieta a qualquer momento com IA.

4. **Periodização de Treino Intercalada & Adaptativa**
   - Treinos estruturados de Segunda a Domingo.
   - Intercala as modalidades que o usuário tem acesso real: **Academia (Musculação)**, **Corrida (HIIT/Contínua)**, **Ciclismo**, **Caminhada Orientada (LISS)** ou **Treino em Casa (Calistenia)**.
   - Detalhamento de séries, repetições, tempos de execução e orientações biomecânicas.
   - Checklist interativo de execução dos exercícios do dia.

5. **Prontuário Antropométrico & Curva de Peso**
   - Registro de peso periódico.
   - Gráfico de tendência com linha de meta (peso alvo).
   - Cálculo dinâmico do IMC (Índice de Massa Corporal) e classificação.

---

## 🛠️ Tecnologias Utilizadas

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **UI & Estilização**: [React 18](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/)
- **Visualização de Dados**: [Recharts](https://recharts.org/)
- **Ícones**: [Lucide React](https://lucide.dev/) (Design minimalista e profissional)
- **IA Multimodal**: [Google Generative AI (Gemini 2.0 Flash)](https://ai.google.dev/)
- **Banco de Dados & Autenticação**: [Supabase](https://supabase.com/) (PostgreSQL + RLS + Storage)
- **Notificações**: [Sonner](https://sonner.emilkowal.ski/)

---

## 🚀 Como Executar o Projeto

### 1. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse no seu navegador: [http://localhost:3000](http://localhost:3000)

### 2. Configurar Variáveis de Ambiente (`.env.local`)
O arquivo `.env.local` já foi gerado na raiz. Para habilitar persistência remota e IA ao vivo com suas chaves pessoais, preencha:
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
GEMINI_API_KEY=sua-chave-gemini-api
```
> **Nota de Resiliência:** O sistema possui mocks inteligentes integrados. Caso as chaves do Supabase ou Gemini não estejam preenchidas, a aplicação roda em modo de demonstração clínica com cálculos reais da fórmula de Mifflin-St Jeor, gráficos interativos e fluxo completo.

### 3. Migração do Banco de Dados (Supabase)
O arquivo de migração completo encontra-se em:
```
supabase/migrations/001_initial_schema.sql
```
Basta executar o script no SQL Editor do painel Supabase para criar as tabelas com RLS habilitado.
