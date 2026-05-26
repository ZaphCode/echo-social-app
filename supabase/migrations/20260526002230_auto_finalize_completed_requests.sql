create schema if not exists private;

revoke all on schema private from public;

with newly_counted as (
  update public.service_request
  set job_counted_at = now()
  where agreement_state = 'FINISHED'
    and job_counted_at is null
    and provider is not null
  returning provider
),
job_counts as (
  select provider, count(*)::integer as total
  from newly_counted
  group by provider
)
update public.provider_profile pp
set jobs_done = pp.jobs_done + job_counts.total
from job_counts
where pp."user" = job_counts.provider;

with finished_contractings as (
  select distinct on (contracting)
    contracting,
    id,
    coalesce(finished, updated_at, now()) as completed_at
  from public.service_request
  where contracting is not null
    and agreement_state = 'FINISHED'
  order by contracting, coalesce(finished, updated_at, now()) desc
)
update public.contracting c
set is_closed = true,
    closed_at = coalesce(c.closed_at, finished_contractings.completed_at),
    closed_request = coalesce(c.closed_request, finished_contractings.id)
from finished_contractings
where c.id = finished_contractings.contracting
  and c.is_closed = false;

create or replace function private.finalize_finished_service_request()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if new.agreement_state = 'FINISHED'
    and new.job_counted_at is null
    and new.provider is not null
  then
    new.job_counted_at := now();

    update public.provider_profile
    set jobs_done = jobs_done + 1
    where "user" = new.provider;
  end if;

  if new.agreement_state = 'FINISHED'
    and new.contracting is not null
  then
    update public.contracting
    set is_closed = true,
        closed_at = coalesce(closed_at, coalesce(new.finished, now())),
        closed_request = coalesce(closed_request, new.id)
    where id = new.contracting
      and is_closed = false;
  end if;

  return new;
end;
$$;

drop trigger if exists service_request_auto_finalize_finished on public.service_request;

create trigger service_request_auto_finalize_finished
before insert or update of agreement_state, job_counted_at, contracting, provider
on public.service_request
for each row
execute function private.finalize_finished_service_request();
