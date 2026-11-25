update storage.buckets set public = false where id = 'food-photos';

drop policy if exists "Authenticated users can upload food photos" on storage.objects;
drop policy if exists "Anyone can view food photos" on storage.objects;
drop policy if exists "Users can delete their own food photos" on storage.objects;

create policy "Users upload their own meal photos" on storage.objects
for insert to authenticated
with check (bucket_id = 'food-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users read their own meal photos" on storage.objects
for select to authenticated
using (bucket_id = 'food-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users delete their own meal photos" on storage.objects
for delete to authenticated
using (bucket_id = 'food-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
