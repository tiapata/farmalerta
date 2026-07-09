-- =========================================================================
-- Harden create_my_pharmacy(): a bare UPDATE that matches zero rows is not
-- an error in Postgres, so if profiles.id ever doesn't match auth.uid()
-- (e.g. a stale/orphaned profile row), the function previously returned
-- "success" — with a real pharmacy created — while silently failing to
-- link it to the caller's profile. Hit exactly this in practice. Now it
-- raises a clear error instead of failing silently.
-- =========================================================================

create or replace function public.create_my_pharmacy(pharmacy_name text)
returns public.pharmacies
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pharmacy public.pharmacies;
  v_existing_pharmacy_id uuid;
  v_updated_rows int;
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

  get diagnostics v_updated_rows = row_count;
  if v_updated_rows = 0 then
    raise exception 'Não foi possível vincular a farmácia ao seu perfil (profiles.id não corresponde ao usuário autenticado). Contate o suporte.';
  end if;

  return v_pharmacy;
end;
$$;
