-- =============================================
-- Data epoch: lets devices detect a server-side data reset
-- =============================================
-- app_meta holds a single row. data_epoch changes whenever the server data
-- is reset (seed/reset.ts calls bump_data_epoch). On startup the app compares
-- it with the epoch it last synced with and, if different, wipes its local
-- SQLite replica and saved session so they refill from the server.

create table if not exists public.app_meta (
  id boolean primary key default true check (id),
  data_epoch uuid not null default gen_random_uuid(),
  updated_at timestamptz not null default now()
);

insert into public.app_meta (id) values (true)
on conflict (id) do nothing;

alter table public.app_meta enable row level security;

grant select on public.app_meta to anon, authenticated;

drop policy if exists "App meta is readable by everyone" on public.app_meta;
create policy "App meta is readable by everyone"
on public.app_meta
for select
to anon, authenticated
using (true);

-- Only the service role (seed scripts, dashboard) may bump the epoch.
create or replace function public.bump_data_epoch()
returns uuid
language sql
security definer
set search_path = ''
as $$
  update public.app_meta
  set data_epoch = gen_random_uuid(), updated_at = now()
  where id
  returning data_epoch;
$$;

revoke all on function public.bump_data_epoch() from public, anon, authenticated;
grant execute on function public.bump_data_epoch() to service_role;
