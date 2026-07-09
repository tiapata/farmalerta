-- =========================================================================
-- WhatsApp inbox (Evolution API) + Kanban pipelines. Additive migration —
-- unlike the original core-schema recreate, this only adds to a live,
-- in-use schema.
-- =========================================================================

-- ---- Enums ----
create type public.whatsapp_instance_status as enum (
  'not_configured', 'connecting', 'qr_pending', 'connected', 'disconnected', 'error'
);
create type public.conversation_status as enum ('open', 'pending', 'resolved', 'closed');
create type public.message_direction as enum ('inbound', 'outbound');
create type public.message_status as enum ('pending', 'sent', 'delivered', 'read', 'failed');
create type public.message_content_type as enum ('text', 'image', 'audio', 'video', 'document', 'location', 'other');
create type public.pipeline_type as enum ('attendance', 'sales', 'custom');

-- =========================================================================
-- whatsapp_instances — credentials for the Evolution API *server* itself
-- (EVOLUTION_API_URL / EVOLUTION_API_KEY) live as Edge Function secrets,
-- never in the database: it's one shared server hosting one instance per
-- pharmacy, not per-pharmacy credentials. What's per-pharmacy here is just
-- the instance identity, pairing/connection state, and the webhook token
-- we mint ourselves to authenticate Evolution's inbound calls.
-- =========================================================================
create table public.whatsapp_instances (
  id uuid primary key default gen_random_uuid(),
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  evolution_instance_name text not null unique,
  webhook_token text not null,
  phone_number text,
  status public.whatsapp_instance_status not null default 'not_configured',
  qr_code_data text,
  last_connected_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (pharmacy_id)
);
create index whatsapp_instances_pharmacy_id_idx on public.whatsapp_instances (pharmacy_id);

-- =========================================================================
-- conversations
-- =========================================================================
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  whatsapp_instance_id uuid not null references public.whatsapp_instances(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  contact_phone text not null,
  contact_name text,
  status public.conversation_status not null default 'open',
  last_message_at timestamptz,
  last_message_preview text,
  unread_count integer not null default 0,
  assigned_to uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (pharmacy_id, contact_phone)
);
create index conversations_pharmacy_id_idx on public.conversations (pharmacy_id);
create index conversations_customer_id_idx on public.conversations (customer_id);
create index conversations_last_message_idx on public.conversations (pharmacy_id, last_message_at desc);

-- =========================================================================
-- messages — bidirectional conversation thread. Deliberately distinct from
-- `notifications` (outbound-only campaign/automation broadcast log, no
-- threading): merging them would bloat one or the other with columns most
-- rows wouldn't use. pharmacy_id denormalized here for RLS, same reasoning
-- as sale_items.
-- =========================================================================
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  direction public.message_direction not null,
  content_type public.message_content_type not null default 'text',
  body text,
  media_url text,
  evolution_message_id text,
  status public.message_status not null default 'pending',
  sent_by uuid references public.profiles(id) on delete set null,
  error_message text,
  raw_payload jsonb,
  created_at timestamptz not null default now()
);
create index messages_conversation_id_idx on public.messages (conversation_id, created_at);
create index messages_pharmacy_id_idx on public.messages (pharmacy_id);
create unique index messages_evolution_message_id_idx
  on public.messages (evolution_message_id) where evolution_message_id is not null;

-- =========================================================================
-- pipelines / pipeline_stages / pipeline_cards — generic Kanban engine.
-- Supports both an attendance pipeline (seeded by default, wired to the
-- WhatsApp inbox) and a sales-funnel pipeline (created later, same engine,
-- no schema changes needed).
-- =========================================================================
create table public.pipelines (
  id uuid primary key default gen_random_uuid(),
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  name text not null,
  type public.pipeline_type not null default 'custom',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index pipelines_pharmacy_id_idx on public.pipelines (pharmacy_id);
create unique index pipelines_one_default_per_pharmacy
  on public.pipelines (pharmacy_id) where is_default;

create table public.pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  pipeline_id uuid not null references public.pipelines(id) on delete cascade,
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  name text not null,
  position integer not null,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (pipeline_id, position)
);
create index pipeline_stages_pipeline_id_idx on public.pipeline_stages (pipeline_id);

-- A card's `position` uses fractional (double precision) values, not the
-- integer convention used elsewhere in this schema — deliberate: it's the
-- standard cheap-reorder trick for drag-and-drop (new_position = midpoint
-- of neighbors), so moving one card is a single-row UPDATE instead of
-- renumbering an entire column. A periodic re-normalization job is a fine
-- future cleanup if float precision ever gets too tight; not needed now.
create table public.pipeline_cards (
  id uuid primary key default gen_random_uuid(),
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  pipeline_id uuid not null references public.pipelines(id) on delete cascade,
  stage_id uuid not null references public.pipeline_stages(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  title text,
  position double precision not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pipeline_cards_needs_subject check (conversation_id is not null or customer_id is not null)
);
create index pipeline_cards_board_idx on public.pipeline_cards (pipeline_id, stage_id, position);
create index pipeline_cards_conversation_idx on public.pipeline_cards (conversation_id);
-- A conversation can have a card on more than one pipeline (e.g. attendance
-- AND sales), just not two cards on the *same* pipeline.
create unique index pipeline_cards_one_per_conversation_per_pipeline
  on public.pipeline_cards (pipeline_id, conversation_id) where conversation_id is not null;

-- =========================================================================
-- Existing-table adjustment: customers.phone is free text (no canonical
-- format, confirmed — no CHECK constraint, used as-is in wa.me links
-- elsewhere in the app). Inbound WhatsApp numbers arrive as JIDs
-- ("5511999998888@s.whatsapp.net"); this generated column lets matching
-- compare digits-only on both sides without reformatting stored data.
-- =========================================================================
alter table public.customers
  add column phone_digits text generated always as (regexp_replace(phone, '\D', '', 'g')) stored;
create index customers_phone_digits_idx on public.customers (pharmacy_id, phone_digits);

-- =========================================================================
-- Row Level Security
-- =========================================================================
alter table public.whatsapp_instances enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.pipelines enable row level security;
alter table public.pipeline_stages enable row level security;
alter table public.pipeline_cards enable row level security;

-- whatsapp_instances: same shape as integration_configs (read for any
-- pharmacy user, write admin-only — connecting/disconnecting the number is
-- an admin action).
create policy "Pharmacy users can view whatsapp_instances" on public.whatsapp_instances
  for select using (pharmacy_id = public.current_pharmacy_id());
create policy "Pharmacy admins can insert whatsapp_instances" on public.whatsapp_instances
  for insert with check (pharmacy_id = public.current_pharmacy_id() and public.current_role() = 'admin');
create policy "Pharmacy admins can update whatsapp_instances" on public.whatsapp_instances
  for update using (pharmacy_id = public.current_pharmacy_id() and public.current_role() = 'admin');
create policy "Pharmacy admins can delete whatsapp_instances" on public.whatsapp_instances
  for delete using (pharmacy_id = public.current_pharmacy_id() and public.current_role() = 'admin');

create policy "Pharmacy users can manage conversations" on public.conversations
  for all using (pharmacy_id = public.current_pharmacy_id())
  with check (pharmacy_id = public.current_pharmacy_id());

create policy "Pharmacy users can manage messages" on public.messages
  for all using (pharmacy_id = public.current_pharmacy_id())
  with check (pharmacy_id = public.current_pharmacy_id());

create policy "Pharmacy users can manage pipelines" on public.pipelines
  for all using (pharmacy_id = public.current_pharmacy_id())
  with check (pharmacy_id = public.current_pharmacy_id());

create policy "Pharmacy users can manage pipeline_stages" on public.pipeline_stages
  for all using (pharmacy_id = public.current_pharmacy_id())
  with check (pharmacy_id = public.current_pharmacy_id());

create policy "Pharmacy users can manage pipeline_cards" on public.pipeline_cards
  for all using (pharmacy_id = public.current_pharmacy_id())
  with check (pharmacy_id = public.current_pharmacy_id());

-- =========================================================================
-- Triggers
-- =========================================================================
create trigger update_whatsapp_instances_updated_at before update on public.whatsapp_instances for each row execute function public.update_updated_at_column();
create trigger update_conversations_updated_at before update on public.conversations for each row execute function public.update_updated_at_column();
create trigger update_pipelines_updated_at before update on public.pipelines for each row execute function public.update_updated_at_column();
create trigger update_pipeline_stages_updated_at before update on public.pipeline_stages for each row execute function public.update_updated_at_column();
create trigger update_pipeline_cards_updated_at before update on public.pipeline_cards for each row execute function public.update_updated_at_column();

-- =========================================================================
-- Realtime — the Inbox/Kanban UI subscribes to these directly.
-- =========================================================================
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversations;
alter publication supabase_realtime add table public.pipeline_cards;

-- Used by the whatsapp-webhook Edge Function on each inbound message to an
-- already-existing conversation (new conversations start at unread_count=1
-- via a plain insert instead). SECURITY DEFINER not needed — the Edge
-- Function calls this with the service-role client, which already bypasses
-- RLS; kept SECURITY INVOKER (default) since there's no privilege gap to
-- close here.
create or replace function public.increment_conversation_unread(p_conversation_id uuid)
returns void
language sql
set search_path = public
as $$
  update public.conversations
  set unread_count = unread_count + 1
  where id = p_conversation_id;
$$;

-- =========================================================================
-- Extend create_my_pharmacy(): seed the default attendance pipeline in the
-- same transaction a pharmacy comes into existence, matching the existing
-- pattern of that function being the single "pharmacy was just born"
-- choke point.
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
  v_pipeline_id uuid;
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

  insert into public.pipelines (pharmacy_id, name, type, is_default)
  values (v_pharmacy.id, 'Atendimento', 'attendance', true)
  returning id into v_pipeline_id;

  insert into public.pipeline_stages (pipeline_id, pharmacy_id, name, position, color) values
    (v_pipeline_id, v_pharmacy.id, 'Novo', 0, '#3b82f6'),
    (v_pipeline_id, v_pharmacy.id, 'Em Atendimento', 1, '#f59e0b'),
    (v_pipeline_id, v_pharmacy.id, 'Aguardando Cliente', 2, '#a855f7'),
    (v_pipeline_id, v_pharmacy.id, 'Resolvido', 3, '#22c55e');

  return v_pharmacy;
end;
$$;
