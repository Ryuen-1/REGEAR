drop policy "admins manage inventory" on public.items;

create policy "admins add inventory" on public.items for insert to authenticated
with check ((select private.is_admin()));

create policy "admins update inventory" on public.items for update to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "admins delete inventory" on public.items for delete to authenticated
using ((select private.is_admin()));

drop policy "users view own profile" on public.profiles;
drop policy "admins view customer profiles" on public.profiles;

create policy "users and admins view profiles" on public.profiles for select to authenticated
using (id = (select auth.uid()) or (select private.is_admin()));
