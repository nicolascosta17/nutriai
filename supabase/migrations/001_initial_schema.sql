-- ============================================================
-- NutriAI – Initial Database Schema
-- ============================================================

-- 0. Extensions
-- ------------------------------------------------------------
create extension if not exists "uuid-ossp" with schema extensions;

-- ============================================================
-- 1. Tables
-- ============================================================

-- 1.1 Profiles
-- ------------------------------------------------------------
create table public.profiles (
  id          uuid        primary key references auth.users on delete cascade,
  name        text,
  email       text,
  avatar_url  text,
  weight_kg   numeric,
  height_cm   numeric,
  age         int,
  gender      text        check (gender in ('male', 'female', 'other')),
  activity_level text     check (activity_level in ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  goal        text        check (goal in ('lose_weight', 'gain_muscle', 'maintain', 'health')),
  target_weight_kg numeric,
  available_equipment text[],
  daily_calorie_target int,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

-- 1.2 Food Entries
-- ------------------------------------------------------------
create table public.food_entries (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references public.profiles on delete cascade,
  photo_url   text,
  meal_type   text        check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  food_name   text,
  description text,
  calories    int,
  protein_g   numeric,
  carbs_g     numeric,
  fat_g       numeric,
  fiber_g     numeric,
  sugar_g     numeric,
  sodium_mg   numeric,
  ai_analysis text,
  created_at  timestamptz default now() not null
);

-- 1.3 Diet Plans
-- ------------------------------------------------------------
create table public.diet_plans (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references public.profiles on delete cascade,
  plan_name       text,
  daily_calories  int,
  meals           jsonb,
  notes           text,
  is_active       boolean     default true,
  created_at      timestamptz default now() not null
);

-- 1.4 Exercise Plans
-- ------------------------------------------------------------
create table public.exercise_plans (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references public.profiles on delete cascade,
  plan_name   text,
  goal        text,
  difficulty  text        check (difficulty in ('beginner', 'intermediate', 'advanced')),
  schedule    jsonb,
  exercises   jsonb,
  is_active   boolean     default true,
  created_at  timestamptz default now() not null
);

-- 1.5 Workout Logs
-- ------------------------------------------------------------
create table public.workout_logs (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid        not null references public.profiles on delete cascade,
  exercise_plan_id  uuid        references public.exercise_plans on delete set null,
  exercise_name     text,
  duration_min      int,
  calories_burned   int,
  notes             text,
  completed_at      timestamptz default now() not null
);

-- 1.6 Weight Logs
-- ------------------------------------------------------------
create table public.weight_logs (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references public.profiles on delete cascade,
  weight_kg   numeric     not null,
  logged_at   timestamptz default now() not null
);

-- ============================================================
-- 2. Indexes
-- ============================================================

create index idx_food_entries_user_id    on public.food_entries (user_id);
create index idx_food_entries_created_at on public.food_entries (created_at);

create index idx_diet_plans_user_id      on public.diet_plans (user_id);
create index idx_diet_plans_created_at   on public.diet_plans (created_at);

create index idx_exercise_plans_user_id  on public.exercise_plans (user_id);
create index idx_exercise_plans_created_at on public.exercise_plans (created_at);

create index idx_workout_logs_user_id    on public.workout_logs (user_id);
create index idx_workout_logs_completed  on public.workout_logs (completed_at);

create index idx_weight_logs_user_id     on public.weight_logs (user_id);
create index idx_weight_logs_logged_at   on public.weight_logs (logged_at);

-- ============================================================
-- 3. Row-Level Security
-- ============================================================

alter table public.profiles       enable row level security;
alter table public.food_entries    enable row level security;
alter table public.diet_plans      enable row level security;
alter table public.exercise_plans  enable row level security;
alter table public.workout_logs    enable row level security;
alter table public.weight_logs     enable row level security;

-- Profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can delete their own profile"
  on public.profiles for delete
  using (auth.uid() = id);

-- Food Entries
create policy "Users can view their own food entries"
  on public.food_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert their own food entries"
  on public.food_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own food entries"
  on public.food_entries for update
  using (auth.uid() = user_id);

create policy "Users can delete their own food entries"
  on public.food_entries for delete
  using (auth.uid() = user_id);

-- Diet Plans
create policy "Users can view their own diet plans"
  on public.diet_plans for select
  using (auth.uid() = user_id);

create policy "Users can insert their own diet plans"
  on public.diet_plans for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own diet plans"
  on public.diet_plans for update
  using (auth.uid() = user_id);

create policy "Users can delete their own diet plans"
  on public.diet_plans for delete
  using (auth.uid() = user_id);

-- Exercise Plans
create policy "Users can view their own exercise plans"
  on public.exercise_plans for select
  using (auth.uid() = user_id);

create policy "Users can insert their own exercise plans"
  on public.exercise_plans for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own exercise plans"
  on public.exercise_plans for update
  using (auth.uid() = user_id);

create policy "Users can delete their own exercise plans"
  on public.exercise_plans for delete
  using (auth.uid() = user_id);

-- Workout Logs
create policy "Users can view their own workout logs"
  on public.workout_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own workout logs"
  on public.workout_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own workout logs"
  on public.workout_logs for update
  using (auth.uid() = user_id);

create policy "Users can delete their own workout logs"
  on public.workout_logs for delete
  using (auth.uid() = user_id);

-- Weight Logs
create policy "Users can view their own weight logs"
  on public.weight_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own weight logs"
  on public.weight_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own weight logs"
  on public.weight_logs for update
  using (auth.uid() = user_id);

create policy "Users can delete their own weight logs"
  on public.weight_logs for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 4. Auto-create profile on sign-up
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ============================================================
-- 5. Updated-at trigger for profiles
-- ============================================================

create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.update_updated_at();

-- ============================================================
-- 6. Storage bucket for food photos
-- ============================================================

insert into storage.buckets (id, name, public)
values ('food-photos', 'food-photos', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload food photos
create policy "Authenticated users can upload food photos"
  on storage.objects for insert
  with check (
    bucket_id = 'food-photos'
    and auth.role() = 'authenticated'
  );

-- Allow anyone to view food photos (public bucket)
create policy "Anyone can view food photos"
  on storage.objects for select
  using (bucket_id = 'food-photos');

-- Allow users to delete their own food photos
create policy "Users can delete their own food photos"
  on storage.objects for delete
  using (
    bucket_id = 'food-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
