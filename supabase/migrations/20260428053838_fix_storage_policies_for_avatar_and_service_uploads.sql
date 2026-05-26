alter policy "Users can upload their own avatar"
on storage.objects
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

alter policy "Users can update their own avatar"
on storage.objects
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

alter policy "Authenticated users can upload service photos"
on storage.objects
to authenticated
with check (
  bucket_id = 'service-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

alter policy "Users can update their own service photos"
on storage.objects
to authenticated
using (
  bucket_id = 'service-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'service-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Avatar images are publicly accessible'
  ) then
    create policy "Avatar images are publicly accessible"
    on storage.objects
    for select
    to public
    using (bucket_id = 'avatars');
  end if;
end
$$;;
