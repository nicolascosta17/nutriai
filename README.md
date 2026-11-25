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
> **Modo de demonstração:** sem as credenciais do Supabase, o painel e os cálculos demonstrativos continuam disponíveis, mas criar contas e entrar com e-mail e senha ficam desativados. Para habilitar autenticação real, configure `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` no `.env.local` durante o desenvolvimento e nas variáveis do projeto Netlify antes da publicação.

### 3. Migração do Banco de Dados (Supabase)
O arquivo de migração completo encontra-se em:
```
supabase/migrations/001_initial_schema.sql
```
Basta executar o script no SQL Editor do painel Supabase para criar as tabelas com RLS habilitado.

### 4. Autenticação em produção

Use um projeto Supabase dedicado ao NutriAI. Configure as chaves públicas acima no Netlify e aplique o esquema do banco antes de habilitar o cadastro. Em **Authentication → URL Configuration**, defina a URL do site como `https://nutriai-clinical.netlify.app` e autorize `https://nutriai-clinical.netlify.app/auth/callback` e `https://nutriai-clinical.netlify.app/auth/callback?flow=email_change`.

- **E-mail e senha:** configure SMTP próprio com um remetente autorizado. Mantenha a confirmação de cadastro, a confirmação da troca de e-mail nos dois endereços e a troca de senha segura. Configure o mínimo de oito caracteres em Auth. O SMTP padrão do Supabase não envia para o público.
- **Links de confirmação:** no template de cadastro, use `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email`. No template de troca de e-mail, use `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email_change`. Essa configuração permite que o link de e-mail funcione também em um navegador diferente do usado para solicitá-lo.
- **Google:** em Google Cloud, crie um cliente OAuth do tipo **Aplicativo da Web** para o NutriAI. Autorize a origem do site e a URI de redirecionamento fornecida pelo painel do Supabase, no formato `https://<project-ref>.supabase.co/auth/v1/callback`. Em Supabase **Authentication → Sign In / Providers → Google**, configure o Client ID e o Client Secret. Após habilitar o provedor, defina `NEXT_PUBLIC_GOOGLE_SIGN_IN=true` no Netlify e publique novamente. Guarde o Client Secret no Supabase.
