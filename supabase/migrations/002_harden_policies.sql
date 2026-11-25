alter function public.update_updated_at() set search_path = '';

create index if not exists idx_workout_logs_exercise_plan_id
  on public.workout_logs (exercise_plan_id);

alter policy "Users can view their own profile"
  on public.profiles to authenticated
  using ((select auth.uid()) = id);

alter policy "Users can update their own profile"
  on public.profiles to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

alter policy "Users can insert their own profile"
  on public.profiles to authenticated
  with check ((select auth.uid()) = id);

alter policy "Users can delete their own profile"
  on public.profiles to authenticated
  using ((select auth.uid()) = id);

alter policy "Users can view their own food entries"
  on public.food_entries to authenticated
  using ((select auth.uid()) = user_id);

alter policy "Users can insert their own food entries"
  on public.food_entries to authenticated
  with check ((select auth.uid()) = user_id);

alter policy "Users can update their own food entries"
  on public.food_entries to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

alter policy "Users can delete their own food entries"
  on public.food_entries to authenticated
  using ((select auth.uid()) = user_id);

alter policy "Users can view their own diet plans"
  on public.diet_plans to authenticated
  using ((select auth.uid()) = user_id);

alter policy "Users can insert their own diet plans"
  on public.diet_plans to authenticated
  with check ((select auth.uid()) = user_id);

alter policy "Users can update their own diet plans"
  on public.diet_plans to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

alter policy "Users can delete their own diet plans"
  on public.diet_plans to authenticated
  using ((select auth.uid()) = user_id);

alter policy "Users can view their own exercise plans"
  on public.exercise_plans to authenticated
  using ((select auth.uid()) = user_id);

alter policy "Users can insert their own exercise plans"
  on public.exercise_plans to authenticated
  with check ((select auth.uid()) = user_id);

alter policy "Users can update their own exercise plans"
  on public.exercise_plans to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

alter policy "Users can delete their own exercise plans"
  on public.exercise_plans to authenticated
  using ((select auth.uid()) = user_id);

alter policy "Users can view their own workout logs"
  on public.workout_logs to authenticated
  using ((select auth.uid()) = user_id);

alter policy "Users can insert their own workout logs"
  on public.workout_logs to authenticated
  with check ((select auth.uid()) = user_id);

alter policy "Users can update their own workout logs"
  on public.workout_logs to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

alter policy "Users can delete their own workout logs"
  on public.workout_logs to authenticated
  using ((select auth.uid()) = user_id);

alter policy "Users can view their own weight logs"
  on public.weight_logs to authenticated
  using ((select auth.uid()) = user_id);

alter policy "Users can insert their own weight logs"
  on public.weight_logs to authenticated
  with check ((select auth.uid()) = user_id);

alter policy "Users can update their own weight logs"
  on public.weight_logs to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

alter policy "Users can delete their own weight logs"
  on public.weight_logs to authenticated
  using ((select auth.uid()) = user_id);
