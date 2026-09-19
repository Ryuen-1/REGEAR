create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  customer_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (item_id, customer_id)
);

create table public.messages (
  id bigint generated always as identity primary key,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index conversations_customer_updated_idx on public.conversations (customer_id, updated_at desc);
create index conversations_item_idx on public.conversations (item_id);
create index messages_conversation_created_idx on public.messages (conversation_id, created_at);
create index messages_sender_idx on public.messages (sender_id);

create trigger conversations_updated_at before update on public.conversations
for each row execute function public.set_updated_at();

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;
create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and is_admin
  );
$$;
revoke execute on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

revoke all on public.conversations, public.messages from anon, authenticated;
grant select, insert on public.conversations to authenticated;
grant update (updated_at) on public.conversations to authenticated;
grant select, insert, update on public.messages to authenticated;
grant insert, update, delete on public.items to authenticated;

create policy "admins manage inventory" on public.items for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "admins view customer profiles" on public.profiles for select to authenticated
using (
  id = (select auth.uid())
  or (select private.is_admin())
);

create policy "participants view conversations" on public.conversations for select to authenticated
using (
  customer_id = (select auth.uid())
  or (select private.is_admin())
);

create policy "customers start conversations" on public.conversations for insert to authenticated
with check (customer_id = (select auth.uid()));

create policy "participants refresh conversations" on public.conversations for update to authenticated
using (customer_id = (select auth.uid()) or (select private.is_admin()))
with check (customer_id = (select auth.uid()) or (select private.is_admin()));

create policy "participants view messages" on public.messages for select to authenticated
using (exists (
  select 1 from public.conversations conversation
  where conversation.id = conversation_id
    and (
      conversation.customer_id = (select auth.uid())
      or (select private.is_admin())
    )
));

create policy "participants send messages" on public.messages for insert to authenticated
with check (
  sender_id = (select auth.uid())
  and exists (
    select 1 from public.conversations conversation
    where conversation.id = conversation_id
      and (
        conversation.customer_id = (select auth.uid())
        or (select private.is_admin())
      )
  )
);

create policy "participants mark messages read" on public.messages for update to authenticated
using (exists (
  select 1 from public.conversations conversation
  where conversation.id = conversation_id
    and (
      conversation.customer_id = (select auth.uid())
      or (select private.is_admin())
    )
))
with check (exists (
  select 1 from public.conversations conversation
  where conversation.id = conversation_id
    and (
      conversation.customer_id = (select auth.uid())
      or (select private.is_admin())
    )
));
