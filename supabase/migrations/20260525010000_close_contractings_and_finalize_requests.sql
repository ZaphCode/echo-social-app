alter table public.contracting
  add column if not exists is_closed boolean not null default false,
  add column if not exists closed_at timestamptz,
  add column if not exists closed_request uuid references public.service_request(id);

alter table public.service_request
  add column if not exists job_counted_at timestamptz;

create index if not exists contracting_is_closed_idx
  on public.contracting(is_closed);

create or replace function public.finalize_request_completion(request_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  req public.service_request%rowtype;
  counted_at timestamptz;
  did_close boolean := false;
begin
  select *
  into req
  from public.service_request
  where id = request_id;

  if not found then
    raise exception 'Service request % not found', request_id;
  end if;

  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if auth.uid() <> req.client and auth.uid() <> req.provider then
    raise exception 'Not allowed to finalize request %', request_id;
  end if;

  if req.agreement_state <> 'FINISHED' then
    raise exception 'Request % is not finished', request_id;
  end if;

  update public.service_request
  set job_counted_at = now()
  where id = req.id
    and job_counted_at is null
  returning job_counted_at into counted_at;

  if counted_at is not null then
    update public.provider_profile
    set jobs_done = jobs_done + 1
    where "user" = req.provider;
  end if;

  if req.contracting is not null then
    update public.contracting
    set is_closed = true,
        closed_at = coalesce(closed_at, now()),
        closed_request = coalesce(closed_request, req.id)
    where id = req.contracting
      and is_closed = false;

    did_close := found;
  end if;

  return jsonb_build_object(
    'did_increment_jobs', counted_at is not null,
    'did_close_contracting', did_close,
    'contracting_id', req.contracting
  );
end;
$$;

grant execute on function public.finalize_request_completion(uuid) to authenticated;
