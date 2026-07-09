-- =========================================================================
-- Pharmacy onboarding: lets a freshly-signed-up user (profile with
-- pharmacy_id = NULL, created by handle_new_user()) create their own
-- pharmacy and become its admin. Discovered missing when a real user hit
-- "Usuário sem farmácia associada" on their very first import attempt —
-- there was previously no way at all for a new signup to get past this.
-- =========================================================================

-- SECURITY DEFINER: bypasses RLS internally (there is deliberately no
-- INSERT policy on public.pharmacies for ordinary clients — this function
-- is the only sanctioned way to create one for yourself), but only ever
-- acts on the caller's own profile, and only if they don't already have a
-- pharmacy, so it can't be used to hijack or duplicate an assignment.
create or replace function public.create_my_pharmacy(pharmacy_name text)
returns public.pharmacies
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pharmacy public.pharmacies;
  v_existing_pharmacy_id uuid;
begin
  select pharmacy_id into v_existing_pharmacy_id from public.profiles where id = auth.uid();

  if v_existing_pharmacy_id is not null then
    raise exception 'Usuário já está associado a uma farmácia';
  end if;

  if pharmacy_name is null or length(trim(pharmacy_name)) = 0 then
    raise exception 'Nome da farmácia é obrigatório';
  end if;

  insert into public.pharmacies (name) values (trim(pharmacy_name)) returning * into v_pharmacy;

  update public.profiles
  set pharmacy_id = v_pharmacy.id, role = 'admin'
  where id = auth.uid();

  return v_pharmacy;
end;
$$;

grant execute on function public.create_my_pharmacy(text) to authenticated;

-- Close the gap this flow would otherwise open: without this, any user
-- could directly PATCH their own profiles row via the REST API to set
-- pharmacy_id to an arbitrary existing pharmacy, or set role = 'admin'
-- themselves. Only create_my_pharmacy() (SECURITY DEFINER, bypasses RLS)
-- may change those two columns from here on.
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id)
  with check (
    auth.uid() = id
    and pharmacy_id is not distinct from public.current_pharmacy_id()
    and role is not distinct from public.current_role()
  );
