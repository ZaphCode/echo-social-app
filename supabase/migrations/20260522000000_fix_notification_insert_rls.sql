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
    where sr.id = notification.request
      and notification.service = sr.service
      and auth.uid() in (sr.client, s.provider)
      and notification.user in (sr.client, s.provider)
      and notification.user <> auth.uid()
  )
);
