create table if not exists public.contracting (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references public.profiles(id) on delete cascade,
  category uuid not null references public.service_category(id),
  name text not null,
  description text not null,
  base_price numeric not null check (base_price > 0),
  photos text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.contracting enable row level security;

grant select, insert, update, delete on public.contracting to authenticated;

create index if not exists contracting_category_idx
  on public.contracting(category);

create index if not exists contracting_owner_idx
  on public.contracting(owner);

create policy "Authenticated users can read contractings"
on public.contracting
for select
to authenticated
using (true);

create policy "Users can create their own contractings"
on public.contracting
for insert
to authenticated
with check (owner = auth.uid());

create policy "Users can update their own contractings"
on public.contracting
for update
to authenticated
using (owner = auth.uid())
with check (owner = auth.uid());

create policy "Users can delete their own contractings"
on public.contracting
for delete
to authenticated
using (owner = auth.uid());

alter table public.service_request
  add column if not exists provider uuid references public.profiles(id),
  add column if not exists contracting uuid references public.contracting(id);

update public.service_request sr
set provider = s.provider
from public.service s
where sr.service = s.id
  and sr.provider is null;

alter table public.service_request
  alter column provider set not null,
  alter column service drop not null;

alter table public.service_request
  drop constraint if exists service_request_one_subject_chk,
  add constraint service_request_one_subject_chk
    check (
      (service is not null and contracting is null)
      or (service is null and contracting is not null)
    );

create index if not exists service_request_provider_idx
  on public.service_request(provider);

create index if not exists service_request_contracting_idx
  on public.service_request(contracting);

create unique index if not exists service_request_contracting_provider_key
  on public.service_request(contracting, provider)
  where contracting is not null;

create policy "Participants can read contracting applications"
on public.service_request
for select
to authenticated
using (
  contracting is not null
  and auth.uid() in (client, provider)
);

create policy "Providers can apply to contractings"
on public.service_request
for insert
to authenticated
with check (
  contracting is not null
  and service is null
  and provider = auth.uid()
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'provider'
  )
  and exists (
    select 1
    from public.contracting c
    where c.id = service_request.contracting
      and c.owner = service_request.client
      and c.owner <> auth.uid()
  )
);

create policy "Participants can update contracting applications"
on public.service_request
for update
to authenticated
using (
  contracting is not null
  and auth.uid() in (client, provider)
)
with check (
  contracting is not null
  and auth.uid() in (client, provider)
);

create policy "Participants can read service negotiations by explicit provider"
on public.service_request
for select
to authenticated
using (
  service is not null
  and auth.uid() in (client, provider)
);

create policy "Participants can update service negotiations by explicit provider"
on public.service_request
for update
to authenticated
using (
  service is not null
  and auth.uid() in (client, provider)
)
with check (
  service is not null
  and auth.uid() in (client, provider)
);

alter table public.review
  add column if not exists contracting uuid references public.contracting(id),
  add column if not exists request uuid references public.service_request(id);

alter table public.review
  alter column service drop not null;

alter table public.review
  drop constraint if exists review_one_subject_chk,
  add constraint review_one_subject_chk
    check (
      (service is not null and contracting is null)
      or (service is null and contracting is not null)
    );

create index if not exists review_contracting_idx
  on public.review(contracting);

create index if not exists review_request_idx
  on public.review(request);

create unique index if not exists review_reviewer_service_key
  on public.review(reviewer, service)
  where service is not null;

create unique index if not exists review_reviewer_contracting_key
  on public.review(reviewer, contracting)
  where contracting is not null;

create policy "Contracting publishers can review finished providers"
on public.review
for insert
to authenticated
with check (
  service is null
  and contracting is not null
  and request is not null
  and reviewer = auth.uid()
  and type = 'AS_CLIENT'
  and exists (
    select 1
    from public.service_request sr
    join public.contracting c on c.id = sr.contracting
    where sr.id = review.request
      and sr.contracting = review.contracting
      and sr.agreement_state = 'FINISHED'
      and sr.client = auth.uid()
      and sr.provider = review.reviewed
      and c.owner = auth.uid()
  )
);

create policy "Contracting reviews are readable by authenticated users"
on public.review
for select
to authenticated
using (contracting is not null);

alter table public.notification
  add column if not exists contracting uuid references public.contracting(id);

grant select, insert, update on public.notification to authenticated;

drop policy if exists "Users can create notifications for request counterparties" on public.notification;

create policy "Users can create notifications for request counterparties"
on public.notification
for insert
to authenticated
with check (
  request is not null
  and (
    exists (
      select 1
      from public.service_request sr
      where sr.id = request
        and sr.service is not null
        and notification.service = sr.service
        and notification.contracting is null
        and (
          (auth.uid() = sr.client and "user" = sr.provider)
          or (auth.uid() = sr.provider and "user" = sr.client)
        )
    )
    or exists (
      select 1
      from public.service_request sr
      where sr.id = request
        and sr.contracting is not null
        and notification.contracting = sr.contracting
        and notification.service is null
        and (
          (auth.uid() = sr.client and "user" = sr.provider)
          or (auth.uid() = sr.provider and "user" = sr.client)
        )
    )
  )
);
