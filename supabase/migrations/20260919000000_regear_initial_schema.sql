create extension if not exists pgcrypto;
create extension if not exists pg_cron;

create type public.item_status as enum ('available', 'reserved', 'sold');
create type public.payment_status as enum ('pending', 'paid', 'failed', 'refunded');

create table public.items (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text not null,
  category text not null,
  price numeric(12,2) not null check (price > 0),
  condition text not null check (condition in ('Like New', 'Excellent', 'Good', 'Fair')),
  size text,
  images text[] not null default '{}',
  status public.item_status not null default 'available',
  reserved_until timestamptz,
  reserved_by uuid references auth.users(id) on delete set null,
  reservation_token uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reservation_state_valid check (
    (status = 'reserved' and reserved_until is not null and reservation_token is not null)
    or (status <> 'reserved' and reserved_until is null and reservation_token is null)
  )
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  item_id uuid not null references public.items(id) on delete restrict,
  buyer_email text not null,
  buyer_name text not null,
  shipping_address jsonb not null default '{}'::jsonb,
  total_price numeric(12,2) not null check (total_price > 0),
  payment_status public.payment_status not null default 'pending',
  stripe_session_id text unique,
  created_at timestamptz not null default now()
);

create table public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create index items_available_created_idx on public.items (created_at desc) where status = 'available';
create index items_category_status_idx on public.items (category, status);
create index items_reservation_expiry_idx on public.items (reserved_until) where status = 'reserved';
create index orders_user_created_idx on public.orders (user_id, created_at desc);
create index orders_item_idx on public.orders (item_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger items_updated_at before update on public.items for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name) values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', ''));
  return new;
end;
$$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Backfill users who signed up before this schema was deployed.
insert into public.profiles (id, display_name)
select id, coalesce(raw_user_meta_data ->> 'display_name', '')
from auth.users
on conflict (id) do nothing;

-- REGEAR's owner account. Authorization remains in a server-controlled table,
-- never in user-editable user_metadata.
update public.profiles as profile
set is_admin = true
from auth.users as auth_user
where profile.id = auth_user.id
  and lower(auth_user.email) = 'ian.quimbo2004@gmail.com';

create or replace function public.reserve_item(target_item uuid, guest_token uuid)
returns public.items
language plpgsql security invoker set search_path = '' as $$
declare result public.items;
begin
  update public.items
  set status = 'reserved', reserved_until = now() + interval '15 minutes',
      reserved_by = (select auth.uid()), reservation_token = guest_token
  where id = target_item
    and (status = 'available' or (status = 'reserved' and reserved_until < now()))
  returning * into result;
  if result.id is null then raise exception 'ITEM_UNAVAILABLE' using errcode = 'P0001'; end if;
  return result;
end;
$$;

create or replace function public.release_item(target_item uuid, guest_token uuid)
returns boolean language plpgsql security invoker set search_path = '' as $$
begin
  update public.items set status = 'available', reserved_until = null, reserved_by = null, reservation_token = null
  where id = target_item and status = 'reserved'
    and (reservation_token = guest_token or reserved_by = (select auth.uid()));
  return found;
end;
$$;

create or replace function public.release_expired_reservations()
returns integer language plpgsql security definer set search_path = '' as $$
declare released integer;
begin
  update public.items set status = 'available', reserved_until = null, reserved_by = null, reservation_token = null
  where status = 'reserved' and reserved_until < now();
  get diagnostics released = row_count;
  return released;
end;
$$;
revoke execute on function public.release_expired_reservations() from public, anon, authenticated;

alter table public.items enable row level security;
alter table public.orders enable row level security;
alter table public.favorites enable row level security;
alter table public.profiles enable row level security;

revoke all on public.items, public.orders, public.favorites, public.profiles from anon, authenticated;
grant select on public.items to anon, authenticated;
grant select on public.orders to authenticated;
grant select, insert, delete on public.favorites to authenticated;
grant select on public.profiles to authenticated;
grant execute on function public.reserve_item(uuid, uuid) to anon, authenticated;
grant execute on function public.release_item(uuid, uuid) to anon, authenticated;

create policy "catalog items are public" on public.items for select to anon, authenticated using (true);
create policy "buyers view their orders" on public.orders for select to authenticated using ((select auth.uid()) = user_id);
create policy "buyers view own favorites" on public.favorites for select to authenticated using ((select auth.uid()) = user_id);
create policy "buyers add own favorites" on public.favorites for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "buyers remove own favorites" on public.favorites for delete to authenticated using ((select auth.uid()) = user_id);
create policy "users view own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('item-images', 'item-images', true, 10485760, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "admins upload item images" on storage.objects for insert to authenticated
with check (bucket_id = 'item-images' and exists (select 1 from public.profiles where id = (select auth.uid()) and is_admin));
create policy "admins update item images" on storage.objects for update to authenticated
using (bucket_id = 'item-images' and exists (select 1 from public.profiles where id = (select auth.uid()) and is_admin))
with check (bucket_id = 'item-images' and exists (select 1 from public.profiles where id = (select auth.uid()) and is_admin));
create policy "admins delete item images" on storage.objects for delete to authenticated
using (bucket_id = 'item-images' and exists (select 1 from public.profiles where id = (select auth.uid()) and is_admin));

select cron.schedule('release-expired-regear-reservations', '* * * * *', $$select public.release_expired_reservations()$$);
