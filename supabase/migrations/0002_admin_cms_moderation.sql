-- LISTOFICIOS / ADMINISTRACION, CMS Y MODERACION
-- Ejecutar una sola vez en Supabase > SQL Editor.
-- Migracion incremental: conserva cuentas, perfiles, servicios e imagenes actuales.

begin;

alter table public.user_profiles drop constraint if exists user_profiles_role_check;
alter table public.user_profiles
  add constraint user_profiles_role_check check (role in ('user', 'moderator', 'admin'));

alter table public.professional_profiles
  add column if not exists moderation_status text not null default 'approved',
  add column if not exists moderation_note text;
alter table public.professional_profiles drop constraint if exists professional_profiles_moderation_status_check;
alter table public.professional_profiles add constraint professional_profiles_moderation_status_check
  check (moderation_status in ('pending', 'approved', 'rejected', 'changes_requested'));

alter table public.services
  add column if not exists moderation_status text not null default 'approved',
  add column if not exists moderation_note text;
alter table public.services drop constraint if exists services_moderation_status_check;
alter table public.services add constraint services_moderation_status_check
  check (moderation_status in ('pending', 'approved', 'rejected', 'changes_requested'));

create table if not exists public.moderation_rules (
  id uuid primary key default gen_random_uuid(),
  term text not null,
  normalized_term text not null,
  match_type text not null default 'word' check (match_type in ('word', 'phrase')),
  action text not null check (action in ('review', 'block')),
  scopes text[] not null default array['profile','service','review','support','report']::text[],
  category text not null default 'inappropriate',
  notes text not null default '',
  active boolean not null default true,
  hit_count integer not null default 0,
  created_by uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (normalized_term, match_type, action)
);

create table if not exists public.moderation_cases (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('profile', 'service', 'review', 'support', 'report', 'media')),
  target_id text,
  user_id uuid references public.user_profiles(id) on delete set null,
  payload_snapshot jsonb not null default '{}'::jsonb,
  matches jsonb not null default '[]'::jsonb,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  status text not null default 'open' check (status in ('open', 'assigned', 'resolved', 'dismissed')),
  decision text not null default 'pending' check (decision in ('pending', 'approved', 'rejected', 'changes_requested')),
  public_reason text not null default '',
  internal_note text not null default '',
  assigned_to uuid references public.user_profiles(id) on delete set null,
  resolved_by uuid references public.user_profiles(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media_submissions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.professional_profiles(id) on delete cascade,
  user_id uuid references public.user_profiles(id) on delete set null,
  kind text not null check (kind in ('avatar', 'cover', 'work')),
  storage_key text not null unique,
  alt text not null default '',
  caption text not null default '',
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  replaces_item_id uuid references public.portfolio_items(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  moderation_note text not null default '',
  reviewed_by uuid references public.user_profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_assets (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('logo', 'logo_compact', 'favicon', 'pwa_icon', 'open_graph', 'hero')),
  storage_key text not null unique,
  alt text not null default '',
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  bytes integer not null default 0,
  created_by uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.site_config_versions (
  id uuid primary key default gen_random_uuid(),
  version integer not null unique,
  status text not null check (status in ('draft', 'published', 'archived')),
  config jsonb not null,
  change_note text not null default '',
  created_by uuid references public.user_profiles(id) on delete set null,
  published_by uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

alter table public.moderation_actions
  add column if not exists actor_role text,
  add column if not exists request_id text,
  add column if not exists before_data jsonb not null default '{}'::jsonb,
  add column if not exists after_data jsonb not null default '{}'::jsonb;

create index if not exists moderation_rules_active_scope_idx on public.moderation_rules(active, action);
create index if not exists moderation_cases_queue_idx on public.moderation_cases(status, priority, created_at);
create index if not exists moderation_cases_target_idx on public.moderation_cases(target_type, target_id);
create index if not exists moderation_cases_assigned_idx on public.moderation_cases(assigned_to, status);
create index if not exists media_submissions_queue_idx on public.media_submissions(status, created_at);
create index if not exists site_assets_kind_idx on public.site_assets(kind, created_at desc);
create unique index if not exists site_config_one_draft_idx on public.site_config_versions(status) where status = 'draft';
create unique index if not exists site_config_one_published_idx on public.site_config_versions(status) where status = 'published';

insert into public.moderation_rules (term, normalized_term, match_type, action, category, notes)
values
  ('dinero fácil', 'dinero facil', 'phrase', 'review', 'spam', 'Promesa comercial de riesgo'),
  ('ganancia garantizada', 'ganancia garantizada', 'phrase', 'review', 'scam', 'Promesa económica engañosa'),
  ('sin ningún riesgo', 'sin ningun riesgo', 'phrase', 'review', 'scam', 'Afirmación absoluta sospechosa'),
  ('contenido sexual explícito', 'contenido sexual explicito', 'phrase', 'block', 'sexual', 'Contenido ajeno al marketplace')
on conflict (normalized_term, match_type, action) do nothing;

insert into public.site_config_versions (version, status, config, change_note)
select 1, 'published', jsonb_build_object(
  'schemaVersion', 1,
  'brand', jsonb_build_object(
    'name', 'Listoficios', 'shortName', 'Listoficios',
    'description', 'Servicios y profesionales de Bella Vista, Tucumán.',
    'logoAssetId', null, 'compactLogoAssetId', null, 'faviconAssetId', null,
    'pwaAssetId', null, 'openGraphAssetId', null
  ),
  'theme', jsonb_build_object('preset', 'forest', 'brand', '#18715f', 'ink', '#102f29', 'accent', '#bff16f'),
  'home', jsonb_build_object(
    'eyebrow', 'Hecho para Bella Vista',
    'title', 'Encontrá a alguien de confianza',
    'highlight', 'cerca tuyo.',
    'description', 'Buscá un servicio, compará perfiles y hablá directamente por WhatsApp. Fácil, local y sin registrarte.',
    'primaryCtaLabel', 'Buscar profesionales', 'primaryCtaHref', '/profesionales',
    'professionalCtaLabel', 'Publicar mi servicio', 'professionalCtaHref', '/profesionales/crear-perfil',
    'featuredProfileSlug', '', 'heroAssetId', null,
    'trustTitle', 'Más claridad antes de llamar.',
    'trustDescription', 'Listoficios organiza la información para ayudarte a elegir.',
    'finalCtaTitle', 'Tu próximo cliente puede estar a pocas cuadras.',
    'finalCtaDescription', 'Publicá lo que hacés y dejá que Bella Vista te encuentre.'
  ),
  'footer', jsonb_build_object('tagline', 'Hecho en Tucumán.', 'contactEmail', '', 'instagramUrl', '', 'facebookUrl', ''),
  'announcement', jsonb_build_object('enabled', false, 'text', '', 'href', ''),
  'seo', jsonb_build_object('title', 'Listoficios | Profesionales en Bella Vista', 'description', 'Encontrá profesionales y servicios en Bella Vista, Tucumán.')
), 'Configuración inicial'
where not exists (select 1 from public.site_config_versions);

alter table public.moderation_rules enable row level security;
alter table public.moderation_cases enable row level security;
alter table public.media_submissions enable row level security;
alter table public.site_assets enable row level security;
alter table public.site_config_versions enable row level security;

revoke all on public.moderation_rules, public.moderation_cases, public.media_submissions, public.site_assets, public.site_config_versions from anon, authenticated;
grant all on public.moderation_rules, public.moderation_cases, public.media_submissions, public.site_assets, public.site_config_versions to service_role;

commit;

select
  (select count(*) from public.moderation_rules) as moderation_rules,
  (select count(*) from public.site_config_versions where status = 'published') as published_config,
  (select count(*) from public.professional_profiles where moderation_status = 'approved') as approved_profiles;
