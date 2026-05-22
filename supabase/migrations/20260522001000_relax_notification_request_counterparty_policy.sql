drop policy if exists "Users can create notifications for request counterparties" on public.notification;

create policy "Users can create notifications for request counterparties"
on public.notification
for insert
to authenticated
with check (
  request is not null
  and exists (
    select 1
    from public.service_request sr
    join public.service s on s.id = sr.service
    where sr.id = request
      and (
        (auth.uid() = sr.client and "user" = s.provider)
        or (auth.uid() = s.provider and "user" = sr.client)
      )
  )
);
