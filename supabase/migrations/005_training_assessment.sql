alter table public.profiles add column if not exists training_assessment jsonb;
alter table public.exercise_plans add column if not exists assessment_revision uuid;
