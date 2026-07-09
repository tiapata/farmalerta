-- =========================================================================
-- FarmAlerta core schema — full recreate (test data only, safe to drop).
-- Replaces the two stale 2026-05-17 migrations and reconciles undocumented
-- live-DB drift (integrations, notifications, extra pharmacies.* columns,
-- missing campaigns/messages) discovered by auditing backup/*.csv against
-- git migrations. See crm-farmacia-ai-documentos-iniciais/ for the product
-- ADRs this schema implements (Universal Middleware, canonical model,
-- WhatsApp-first, human-approved campaigns except pre-approved automations).
-- =========================================================================

-- ---- Drop everything (defensive: live DB has objects never migrated) ----
drop table if exists public.notifications cascade;
drop table if exists public.messages cascade;
drop table if exists public.automation_rules cascade;
drop table if exists public.campaigns cascade;
drop table if exists public.sync_runs cascade;
drop table if exists public.integration_configs cascade;
drop table if exists public.integrations cascade;
drop table if exists public.sale_items cascade;
drop table if exists public.sales cascade;
drop table if exists public.products cascade;
drop table if exists public.customers cascade;
drop table if exists public.profiles cascade;
drop table if exists public.pharmacies cascade;

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.update_customer_on_sale() cascade;
drop function if exists public.update_updated_at_column() cascade;
drop function if exists public.current_pharmacy_id() cascade;
drop function if exists public.current_role() cascade;

drop type if exists public.driver_type cascade;
drop type if exists public.integration_status cascade;
drop type if exists public.sync_run_status cascade;
drop type if exists public.notification_channel cascade;
drop type if exists public.notification_type cascade;
drop type if exists public.notification_status cascade;

-- ---- Enums ----
create type public.driver_type as enum (
  'official_api',       -- Tier 1
  'automated_export',   -- Tier 2 (v1 target: CSV/XLSX)
  'readonly_db',         -- Tier 3
  'nfce_xml',            -- Tier 4
  'rpa_ui'                -- Tier 5
);

create type public.integration_status as enum ('not_configured', 'active', 'paused', 'error');
create type public.sync_run_status as enum ('running', 'success', 'partial', 'failed');
create type public.notification_channel as enum ('whatsapp', 'push');
create type public.notification_type as enum ('cashback', 'promo', 'reminder');
create type public.notification_status as enum ('pending', 'sent', 'delivered', 'read', 'failed');

-- =========================================================================
-- Core tenant tables
-- =========================================================================

create table public.pharmacies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cnpj text unique,
  email text,
  phone text,
  whatsapp text,
  timezone text not null default 'America/Sao_Paulo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  pharmacy_id uuid references public.pharmacies(id) on delete set null,
  full_name text,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  external_id text,                      -- ERP customer id, for upsert matching by a driver
  name text not null,
  phone text not null,
  email text,
  cpf text,
  birth_date date,
  gender text,
  vip_level text not null default 'Bronze' check (vip_level in ('Bronze', 'Prata', 'Ouro')),
  total_spent numeric(12,2) not null default 0,
  orders_count integer not null default 0,
  last_purchase_at timestamptz,
  status text not null default 'Ativo' check (status in ('Ativo', 'Inativo', 'Recuperável')),
  -- LGPD / consent tracking
  whatsapp_consent boolean not null default false,
  consent_source text check (consent_source in ('import_erp', 'manual', 'checkout', 'whatsapp_optin', 'unknown')),
  consent_recorded_at timestamptz,
  opted_out_at timestamptz,
  preferred_channel text not null default 'whatsapp' check (preferred_channel in ('whatsapp', 'push', 'email', 'none')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (pharmacy_id, external_id)
);
create index customers_pharmacy_id_idx on public.customers (pharmacy_id);
create index customers_phone_idx on public.customers (pharmacy_id, phone);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  external_id text,
  name text not null,
  active_ingredient text,
  is_continuous_use boolean not null default false,
  default_repurchase_days integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (pharmacy_id, external_id)
);
create index products_pharmacy_id_idx on public.products (pharmacy_id);

create table public.sales (
  id uuid primary key default gen_random_uuid(),
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  external_id text,                      -- ERP sale/order id
  total_amount numeric(12,2) not null,
  items_count integer not null default 0,
  payment_method text,
  sale_date timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (pharmacy_id, external_id)
);
create index sales_pharmacy_id_idx on public.sales (pharmacy_id);
create index sales_customer_id_idx on public.sales (customer_id);

-- Line items: fixes the critical gap of not knowing WHAT was purchased.
-- pharmacy_id is denormalized here so RLS can check it directly without
-- joining through sales on every row (standard Postgres RLS pattern).
create table public.sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales(id) on delete cascade,
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  quantity numeric(12,3) not null default 1,
  unit_price numeric(12,2) not null default 0,
  total_price numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);
create index sale_items_sale_id_idx on public.sale_items (sale_id);
create index sale_items_product_id_idx on public.sale_items (pharmacy_id, product_id);

-- =========================================================================
-- Campaigns / automation / notifications
-- =========================================================================

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  title text not null,
  description text,
  type text not null check (type in ('Recompra', 'Recuperação', 'Promocional', 'VIP')),
  status text not null default 'Rascunho'
    check (status in ('Rascunho', 'Aguardando Aprovação', 'Ativa', 'Pausada', 'Finalizada')),
  target_segment jsonb not null default '{}'::jsonb, -- flexible filter, replaces target_vip_levels[]
  ai_generated boolean not null default false,
  approved_by uuid references public.profiles(id),
  approved_at timestamptz,
  scheduled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- ADR-008: an AI-generated campaign can never go live without human approval.
  constraint campaigns_ai_requires_approval check (
    not (ai_generated and status in ('Ativa', 'Pausada', 'Finalizada') and approved_by is null)
  )
);
create index campaigns_pharmacy_id_idx on public.campaigns (pharmacy_id);

-- Pre-approved automation exception to the human-approval rule: the RULE
-- itself is operator-approved once; after that it may fire without a
-- per-message approval step.
create table public.automation_rules (
  id uuid primary key default gen_random_uuid(),
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  name text not null,
  trigger_type text not null check (trigger_type in ('repurchase_due', 'cashback_earned', 'birthday', 'inactivity')),
  channel public.notification_channel not null default 'whatsapp',
  notification_type public.notification_type not null,
  message_template text not null,
  conditions jsonb not null default '{}'::jsonb,
  is_active boolean not null default false,
  approved_by uuid not null references public.profiles(id),
  approved_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index automation_rules_pharmacy_id_idx on public.automation_rules (pharmacy_id);

-- Unifies the old WhatsApp-only "messages" log with push notifications,
-- per VISION.md (WhatsApp = primary channel, push = cashback/promo/reminder).
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete cascade,
  campaign_id uuid references public.campaigns(id) on delete set null,
  automation_rule_id uuid references public.automation_rules(id) on delete set null,
  channel public.notification_channel not null,
  type public.notification_type not null,
  payload jsonb not null default '{}'::jsonb,
  status public.notification_status not null default 'pending',
  scheduled_at timestamptz,
  sent_at timestamptz,
  error_message text,
  created_at timestamptz not null default now()
);
create index notifications_pharmacy_id_idx on public.notifications (pharmacy_id);
create index notifications_customer_id_idx on public.notifications (customer_id);

-- =========================================================================
-- Universal Middleware tables
-- =========================================================================

create table public.integration_configs (
  id uuid primary key default gen_random_uuid(),
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  driver_type public.driver_type not null,
  priority integer not null,             -- 1..5, matches the fallback chain order
  erp_vendor text,
  status public.integration_status not null default 'not_configured',
  config jsonb not null default '{}'::jsonb,   -- non-secret settings (column_mapping, polling cadence, etc.)
  secret_ref text,                        -- opaque reference into a secrets vault; never the secret itself
  last_sync_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (pharmacy_id, driver_type)
);
create index integration_configs_pharmacy_id_idx on public.integration_configs (pharmacy_id);

create table public.sync_runs (
  id uuid primary key default gen_random_uuid(),
  integration_config_id uuid not null references public.integration_configs(id) on delete cascade,
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status public.sync_run_status not null default 'running',
  records_processed integer not null default 0,
  records_failed integer not null default 0,
  error_details jsonb,
  source_file_name text,                  -- populated by v1's manual-upload driver
  created_at timestamptz not null default now()
);
create index sync_runs_pharmacy_id_idx on public.sync_runs (pharmacy_id);
create index sync_runs_config_id_idx on public.sync_runs (integration_config_id);

-- =========================================================================
-- Row Level Security
-- =========================================================================

alter table public.pharmacies enable row level security;
alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.products enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.campaigns enable row level security;
alter table public.automation_rules enable row level security;
alter table public.notifications enable row level security;
alter table public.integration_configs enable row level security;
alter table public.sync_runs enable row level security;

-- Helper: resolves the caller's pharmacy_id once, SECURITY DEFINER so it
-- doesn't re-trigger RLS on profiles recursively for every policy check.
-- Replaces the repeated `pharmacy_id IN (SELECT pharmacy_id FROM profiles
-- WHERE id = auth.uid())` subquery used ad-hoc in the original migration.
create or replace function public.current_pharmacy_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select pharmacy_id from public.profiles where id = auth.uid()
$$;

create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

-- pharmacies
create policy "Users can view their pharmacy" on public.pharmacies
  for select using (id = public.current_pharmacy_id());
create policy "Admins can update their pharmacy" on public.pharmacies
  for update using (id = public.current_pharmacy_id() and public.current_role() = 'admin');

-- profiles
create policy "Users can view profiles in their pharmacy" on public.profiles
  for select using (id = auth.uid() or pharmacy_id = public.current_pharmacy_id());
create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- tenant-scoped tables: standard FOR ALL pattern
create policy "Pharmacy users can manage customers" on public.customers
  for all using (pharmacy_id = public.current_pharmacy_id())
  with check (pharmacy_id = public.current_pharmacy_id());

create policy "Pharmacy users can manage products" on public.products
  for all using (pharmacy_id = public.current_pharmacy_id())
  with check (pharmacy_id = public.current_pharmacy_id());

create policy "Pharmacy users can manage sales" on public.sales
  for all using (pharmacy_id = public.current_pharmacy_id())
  with check (pharmacy_id = public.current_pharmacy_id());

create policy "Pharmacy users can manage sale_items" on public.sale_items
  for all using (pharmacy_id = public.current_pharmacy_id())
  with check (pharmacy_id = public.current_pharmacy_id());

create policy "Pharmacy users can manage campaigns" on public.campaigns
  for all using (pharmacy_id = public.current_pharmacy_id())
  with check (pharmacy_id = public.current_pharmacy_id());

create policy "Pharmacy admins can manage automation_rules" on public.automation_rules
  for all using (pharmacy_id = public.current_pharmacy_id() and public.current_role() = 'admin')
  with check (pharmacy_id = public.current_pharmacy_id() and public.current_role() = 'admin');

create policy "Pharmacy users can manage notifications" on public.notifications
  for all using (pharmacy_id = public.current_pharmacy_id())
  with check (pharmacy_id = public.current_pharmacy_id());

-- integration_configs holds sensitive-adjacent settings; admin-only write,
-- but any pharmacy user may read (so Settings > Integrações works
-- read-only for non-admin staff too).
create policy "Pharmacy users can view integration_configs" on public.integration_configs
  for select using (pharmacy_id = public.current_pharmacy_id());
create policy "Pharmacy admins can insert integration_configs" on public.integration_configs
  for insert with check (pharmacy_id = public.current_pharmacy_id() and public.current_role() = 'admin');
create policy "Pharmacy admins can update integration_configs" on public.integration_configs
  for update using (pharmacy_id = public.current_pharmacy_id() and public.current_role() = 'admin');
create policy "Pharmacy admins can delete integration_configs" on public.integration_configs
  for delete using (pharmacy_id = public.current_pharmacy_id() and public.current_role() = 'admin');

-- sync_runs is written by the middleware Edge Function's service-role
-- client (which bypasses RLS entirely); authenticated users only need
-- read access for the Settings page's sync-history view.
create policy "Pharmacy users can view sync_runs" on public.sync_runs
  for select using (pharmacy_id = public.current_pharmacy_id());

-- =========================================================================
-- Triggers / functions
-- =========================================================================

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_pharmacies_updated_at before update on public.pharmacies for each row execute function public.update_updated_at_column();
create trigger update_profiles_updated_at before update on public.profiles for each row execute function public.update_updated_at_column();
create trigger update_customers_updated_at before update on public.customers for each row execute function public.update_updated_at_column();
create trigger update_products_updated_at before update on public.products for each row execute function public.update_updated_at_column();
create trigger update_campaigns_updated_at before update on public.campaigns for each row execute function public.update_updated_at_column();
create trigger update_automation_rules_updated_at before update on public.automation_rules for each row execute function public.update_updated_at_column();
create trigger update_integration_configs_updated_at before update on public.integration_configs for each row execute function public.update_updated_at_column();

-- Unchanged in spirit from the original: still keyed on `sales` (the
-- header table). sale_items intentionally does NOT re-trigger this — a
-- sale's aggregate total/count is authoritative from the ERP header row,
-- not re-derived by summing line items (protects against rounding/discount
-- drift when a driver only has partial line-item detail).
create or replace function public.update_customer_on_sale()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_total_spent numeric(12,2);
  v_orders_count integer;
begin
  select coalesce(sum(total_amount), 0), count(*)
  into v_total_spent, v_orders_count
  from public.sales
  where customer_id = new.customer_id;

  update public.customers
  set
    total_spent = v_total_spent,
    orders_count = v_orders_count,
    last_purchase_at = new.sale_date,
    status = 'Ativo',
    vip_level = case
      when v_total_spent > 2000 or v_orders_count > 10 then 'Ouro'
      when v_total_spent > 500 or v_orders_count > 3 then 'Prata'
      else 'Bronze'
    end
  where id = new.customer_id;

  return new;
end;
$$;

create trigger trigger_update_customer_on_sale
after insert on public.sales
for each row
when (new.customer_id is not null)
execute function public.update_customer_on_sale();

-- Canonical signup trigger (replaces the ad-hoc, never-committed version
-- referenced in .lovable/plan.md). Creates a pharmacy-less profile;
-- assigning a user to a pharmacy is a deliberate follow-up action, not an
-- auto-join of whatever pharmacy happens to exist first.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', null), 'user')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
