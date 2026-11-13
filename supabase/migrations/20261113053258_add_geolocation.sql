-- =============================================
-- Geolocation: nearby ordering + map of contractings
-- =============================================
-- Public coordinates (contracting.lat/lon, profiles.location) are always
-- snapped to a ~550 m grid so no exact address is ever exposed. The exact
-- point chosen by a contracting owner lives in contracting_location_private,
-- readable only by that owner.
--
-- Distance buckets (keep in sync with src/utils/geo.ts):
--   0: < 2 km, 1: < 10 km, 2: < 30 km, 3: < 100 km, 4: farther, 5: unknown
-- Lists are ordered by bucket first and recency second, so a new request
-- nearby beats an old request nearby, and both beat anything farther away.

create extension if not exists postgis with schema extensions;

-- ---------------------------------------------
-- Helpers
-- ---------------------------------------------
create or replace function public.snap_coord(value double precision)
returns double precision
language sql
immutable
set search_path = ''
as $$
  select case
    when value is null then null
    else round(value / 0.005) * 0.005
  end;
$$;

create or replace function public.distance_bucket(meters double precision)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case
    when meters is null then 5
    when meters < 2000 then 0
    when meters < 10000 then 1
    when meters < 30000 then 2
    when meters < 100000 then 3
    else 4
  end;
$$;

-- ---------------------------------------------
-- CONTRACTING: public approximate location
-- ---------------------------------------------
alter table public.contracting
  add column if not exists lat double precision,
  add column if not exists lon double precision;

alter table public.contracting
  drop constraint if exists contracting_lat_lon_chk,
  add constraint contracting_lat_lon_chk check (
    (lat is null and lon is null)
    or (lat between -90 and 90 and lon between -180 and 180)
  );

alter table public.contracting
  add column if not exists geog extensions.geography(Point, 4326)
  generated always as (
    case
      when lat is not null and lon is not null
        then extensions.st_setsrid(extensions.st_makepoint(lon, lat), 4326)::extensions.geography
    end
  ) stored;

create index if not exists contracting_geog_idx
  on public.contracting using gist (geog);

create index if not exists contracting_created_at_idx
  on public.contracting(created_at desc);

-- Owners can write lat/lon directly through the existing update policy, so
-- snap on every write as well.
create or replace function public.snap_contracting_location()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.lat := public.snap_coord(new.lat);
  new.lon := public.snap_coord(new.lon);
  return new;
end;
$$;

drop trigger if exists snap_contracting_location on public.contracting;
create trigger snap_contracting_location
  before insert or update of lat, lon on public.contracting
  for each row execute function public.snap_contracting_location();

-- ---------------------------------------------
-- CONTRACTING_LOCATION_PRIVATE: exact point, owner only
-- ---------------------------------------------
create table if not exists public.contracting_location_private (
  contracting uuid primary key references public.contracting(id) on delete cascade,
  lat double precision not null check (lat between -90 and 90),
  lon double precision not null check (lon between -180 and 180),
  updated_at timestamptz not null default now()
);

alter table public.contracting_location_private enable row level security;

grant select, insert, update, delete on public.contracting_location_private to authenticated;

create policy "Owners can read their contracting location"
on public.contracting_location_private
for select
to authenticated
using (
  exists (
    select 1 from public.contracting c
    where c.id = contracting_location_private.contracting
      and c.owner = auth.uid()
  )
);

create policy "Owners can create their contracting location"
on public.contracting_location_private
for insert
to authenticated
with check (
  exists (
    select 1 from public.contracting c
    where c.id = contracting_location_private.contracting
      and c.owner = auth.uid()
  )
);

create policy "Owners can update their contracting location"
on public.contracting_location_private
for update
to authenticated
using (
  exists (
    select 1 from public.contracting c
    where c.id = contracting_location_private.contracting
      and c.owner = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.contracting c
    where c.id = contracting_location_private.contracting
      and c.owner = auth.uid()
  )
);

create policy "Owners can delete their contracting location"
on public.contracting_location_private
for delete
to authenticated
using (
  exists (
    select 1 from public.contracting c
    where c.id = contracting_location_private.contracting
      and c.owner = auth.uid()
  )
);

drop trigger if exists set_contracting_location_private_updated_at
  on public.contracting_location_private;
create trigger set_contracting_location_private_updated_at
  before update on public.contracting_location_private
  for each row execute function public.handle_updated_at();

-- Mirror the private point to the public (snapped) columns. Runs as the
-- caller: the owner is allowed to update their own contracting.
create or replace function public.sync_contracting_public_location()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    update public.contracting
    set lat = null, lon = null
    where id = old.contracting;
    return old;
  end if;

  update public.contracting
  set lat = new.lat, lon = new.lon
  where id = new.contracting;
  return new;
end;
$$;

drop trigger if exists sync_contracting_public_location
  on public.contracting_location_private;
create trigger sync_contracting_public_location
  after insert or update or delete on public.contracting_location_private
  for each row execute function public.sync_contracting_public_location();

-- ---------------------------------------------
-- PROFILES: snap the existing (public) location + spatial column
-- ---------------------------------------------
create or replace function public.snap_profile_location()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.location is not null
    and jsonb_typeof(new.location -> 'lat') = 'number'
    and jsonb_typeof(new.location -> 'lon') = 'number' then
    new.location := jsonb_build_object(
      'lat', public.snap_coord((new.location ->> 'lat')::double precision),
      'lon', public.snap_coord((new.location ->> 'lon')::double precision)
    );
  end if;
  return new;
end;
$$;

drop trigger if exists snap_profile_location on public.profiles;
create trigger snap_profile_location
  before insert or update of location on public.profiles
  for each row execute function public.snap_profile_location();

-- One-off: snap every location stored before this migration.
update public.profiles
set location = location
where location is not null;

alter table public.profiles
  add column if not exists geog extensions.geography(Point, 4326)
  generated always as (
    case
      when jsonb_typeof(location -> 'lat') = 'number'
        and jsonb_typeof(location -> 'lon') = 'number'
        then extensions.st_setsrid(
          extensions.st_makepoint(
            (location ->> 'lon')::double precision,
            (location ->> 'lat')::double precision
          ),
          4326
        )::extensions.geography
    end
  ) stored;

create index if not exists profiles_geog_idx
  on public.profiles using gist (geog);

-- ---------------------------------------------
-- RPCs (security invoker: existing RLS still applies)
-- ---------------------------------------------
create or replace function public.list_contractings_nearby(
  p_lat double precision,
  p_lon double precision,
  p_category text,
  p_user uuid
)
returns setof public.contracting
language sql
stable
set search_path = public, extensions
as $$
  select c.*
  from public.contracting c
  where (c.is_closed = false or c.owner = p_user)
    and (p_category = 'all' or c.category::text = p_category)
  order by
    c.is_closed asc,
    case
      when p_lat is null or p_lon is null then 0
      else public.distance_bucket(
        st_distance(c.geog, st_setsrid(st_makepoint(p_lon, p_lat), 4326)::geography)
      )
    end asc,
    c.created_at desc;
$$;

create or replace function public.list_services_nearby(
  p_lat double precision,
  p_lon double precision,
  p_category text
)
returns setof public.service
language sql
stable
set search_path = public, extensions
as $$
  select s.*
  from public.service s
  join public.profiles p on p.id = s.provider
  where p_category = 'all' or s.category::text = p_category
  order by
    case
      when p_lat is null or p_lon is null then 0
      else public.distance_bucket(
        st_distance(p.geog, st_setsrid(st_makepoint(p_lon, p_lat), 4326)::geography)
      )
    end asc,
    s.created_at desc;
$$;

create or replace function public.list_contractings_in_bounds(
  min_lat double precision,
  min_lon double precision,
  max_lat double precision,
  max_lon double precision,
  p_category text
)
returns setof public.contracting
language sql
stable
set search_path = public, extensions
as $$
  select c.*
  from public.contracting c
  where c.is_closed = false
    and c.geog is not null
    and c.geog && st_makeenvelope(min_lon, min_lat, max_lon, max_lat, 4326)::geography
    and (p_category = 'all' or c.category::text = p_category)
  order by c.created_at desc
  limit 200;
$$;

grant execute on function public.list_contractings_nearby(double precision, double precision, text, uuid) to authenticated;
grant execute on function public.list_services_nearby(double precision, double precision, text) to authenticated;
grant execute on function public.list_contractings_in_bounds(double precision, double precision, double precision, double precision, text) to authenticated;

notify pgrst, 'reload schema';
