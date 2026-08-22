-- LISTOFICIOS / SUPABASE AUTH + DATA API
-- Ejecutar una sola vez en Supabase > SQL Editor.
-- IMPORTANTE: reinicia las tablas publicas de Listoficios. No elimina auth.users.

begin;

drop table if exists public.rate_limits cascade;
drop table if exists public.moderation_actions cascade;
drop table if exists public.profile_daily_stats cascade;
drop table if exists public.notifications cascade;
drop table if exists public.support_tickets cascade;
drop table if exists public.reports cascade;
drop table if exists public.review_replies cascade;
drop table if exists public.reviews cascade;
drop table if exists public.contact_events cascade;
drop table if exists public.favorites cascade;
drop table if exists public.portfolio_items cascade;
drop table if exists public.service_categories cascade;
drop table if exists public.services cascade;
drop table if exists public.profile_zones cascade;
drop table if exists public.professional_profiles cascade;
drop table if exists public.categories cascade;
drop table if exists public.zones cascade;
drop table if exists public.user_profiles cascade;

-- Tablas antiguas de Better Auth, si llegaron a crearse.
drop table if exists public.account cascade;
drop table if exists public.session cascade;
drop table if exists public.verification cascade;
drop table if exists public."user" cascade;

drop type if exists public.contact_channel cascade;
drop type if exists public.notification_kind cascade;
drop type if exists public.pricing_mode cascade;
drop type if exists public.profile_status cascade;
drop type if exists public.report_status cascade;
drop type if exists public.report_target cascade;
drop type if exists public.review_status cascade;
drop type if exists public.service_mode cascade;
drop type if exists public.support_status cascade;

create type public.contact_channel as enum ('whatsapp', 'phone');
create type public.notification_kind as enum ('review', 'moderation', 'publication', 'support', 'system');
create type public.pricing_mode as enum ('from', 'hourly', 'fixed', 'quote');
create type public.profile_status as enum ('draft', 'published', 'paused', 'suspended');
create type public.report_status as enum ('open', 'reviewing', 'resolved', 'dismissed');
create type public.report_target as enum ('profile', 'service', 'review');
create type public.review_status as enum ('pending', 'published', 'rejected');
create type public.service_mode as enum ('domicilio', 'taller', 'ambos');
create type public.support_status as enum ('open', 'reviewing', 'resolved', 'closed');

create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  banned boolean not null default false,
  ban_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id text primary key,
  slug text not null unique,
  name text not null,
  description text not null,
  icon text not null,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.zones (
  id text primary key,
  slug text not null unique,
  name text not null,
  description text not null default '',
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.professional_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.user_profiles(id) on delete cascade,
  slug text not null unique,
  display_name text not null,
  headline text not null,
  bio text not null,
  experience_years integer not null default 0 check (experience_years between 0 and 80),
  phone_ciphertext text,
  phone_iv text,
  phone_preview text,
  accent_color text not null default 'forest',
  service_mode public.service_mode not null default 'domicilio',
  status public.profile_status not null default 'draft',
  is_demo boolean not null default false,
  views_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profile_zones (
  profile_id uuid not null references public.professional_profiles(id) on delete cascade,
  zone_id text not null references public.zones(id) on delete restrict,
  primary key (profile_id, zone_id)
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.professional_profiles(id) on delete cascade,
  slug text not null,
  title text not null,
  description text not null,
  custom_service text,
  pricing_mode public.pricing_mode not null default 'quote',
  price_amount integer check (price_amount is null or price_amount > 0),
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, slug)
);

create table public.service_categories (
  service_id uuid not null references public.services(id) on delete cascade,
  category_id text not null references public.categories(id) on delete restrict,
  primary key (service_id, category_id)
);

create table public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.professional_profiles(id) on delete cascade,
  storage_key text not null unique,
  alt text not null default '',
  sort_order integer not null default 0,
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  created_at timestamptz not null default now()
);

create table public.favorites (
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  profile_id uuid not null references public.professional_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, profile_id)
);

create table public.contact_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.user_profiles(id) on delete set null,
  profile_id uuid not null references public.professional_profiles(id) on delete cascade,
  service_id uuid references public.services(id) on delete set null,
  channel public.contact_channel not null,
  visitor_hash text,
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null references public.professional_profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  title text not null,
  body text not null,
  status public.review_status not null default 'pending',
  moderation_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reviews_user_id_fkey foreign key (user_id) references public.user_profiles(id) on delete cascade,
  unique (user_id, profile_id)
);

create table public.review_replies (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null unique references public.reviews(id) on delete cascade,
  profile_id uuid not null references public.professional_profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid references public.user_profiles(id) on delete set null,
  target_type public.report_target not null,
  target_id text not null,
  reason text not null,
  description text not null default '',
  status public.report_status not null default 'open',
  visitor_hash text,
  resolved_by uuid references public.user_profiles(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  user_id uuid references public.user_profiles(id) on delete set null,
  name text not null,
  email text not null,
  user_type text not null,
  topic text not null,
  message text not null,
  status public.support_status not null default 'open',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  kind public.notification_kind not null,
  title text not null,
  body text not null,
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.profile_daily_stats (
  profile_id uuid not null references public.professional_profiles(id) on delete cascade,
  day date not null,
  views integer not null default 0,
  contacts integer not null default 0,
  favorites integer not null default 0,
  primary key (profile_id, day)
);

create table public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references public.user_profiles(id) on delete restrict,
  target_type text not null,
  target_id text not null,
  action text not null,
  reason text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.rate_limits (
  key_hash text not null,
  action text not null,
  window_start timestamptz not null,
  count integer not null default 1,
  expires_at timestamptz not null,
  primary key (key_hash, action, window_start)
);

create index profiles_status_idx on public.professional_profiles(status);
create index profiles_user_idx on public.professional_profiles(user_id);
create index profile_zones_zone_idx on public.profile_zones(zone_id);
create index services_profile_idx on public.services(profile_id);
create index service_categories_category_idx on public.service_categories(category_id);
create index portfolio_profile_idx on public.portfolio_items(profile_id);
create index favorites_profile_idx on public.favorites(profile_id);
create index contacts_profile_created_idx on public.contact_events(profile_id, created_at desc);
create index contacts_user_idx on public.contact_events(user_id);
create index reviews_profile_status_idx on public.reviews(profile_id, status);
create index reports_status_created_idx on public.reports(status, created_at desc);
create index reports_target_idx on public.reports(target_type, target_id);
create index support_status_created_idx on public.support_tickets(status, created_at desc);
create index notifications_user_read_idx on public.notifications(user_id, read_at);
create index moderation_target_idx on public.moderation_actions(target_type, target_id);
create index rate_limits_expiry_idx on public.rate_limits(expires_at);

insert into public.categories (id, slug, name, description, icon, sort_order) values
  ('plomeria', 'plomeria', 'Plomería', 'Pérdidas, instalaciones y urgencias', 'droplet', 0),
  ('electricidad', 'electricidad', 'Electricidad', 'Instalaciones y reparaciones', 'bolt', 1),
  ('gas', 'gas', 'Gasistas', 'Conexión y mantenimiento', 'flame', 2),
  ('pintura', 'pintura', 'Pintura', 'Interiores y exteriores', 'paint', 3),
  ('carpinteria', 'carpinteria', 'Carpintería', 'Muebles y aberturas', 'hammer', 4),
  ('albanileria', 'albanileria', 'Albañilería', 'Obras y reformas', 'brick', 5),
  ('jardineria', 'jardineria', 'Jardinería', 'Poda y cuidado', 'leaf', 6),
  ('refrigeracion', 'refrigeracion', 'Refrigeración', 'Aires y heladeras', 'snowflake', 7);

insert into public.zones (id, slug, name, description, sort_order) values
  ('centro', 'centro', 'Centro', 'Profesionales que trabajan en Centro, Bella Vista.', 0),
  ('los-pinos', 'los-pinos', 'Los Pinos', 'Profesionales que trabajan en Los Pinos, Bella Vista.', 1),
  ('villa-nueva', 'villa-nueva', 'Villa Nueva', 'Profesionales que trabajan en Villa Nueva, Bella Vista.', 2),
  ('el-mollar', 'el-mollar', 'El Mollar', 'Profesionales que trabajan en El Mollar, Bella Vista.', 3),
  ('san-ramon', 'san-ramon', 'San Ramón', 'Profesionales que trabajan en San Ramón, Bella Vista.', 4),
  ('santa-rita', 'santa-rita', 'Santa Rita', 'Profesionales que trabajan en Santa Rita, Bella Vista.', 5),
  ('la-esperanza', 'la-esperanza', 'La Esperanza', 'Profesionales que trabajan en La Esperanza, Bella Vista.', 6),
  ('alrededores', 'alrededores', 'Alrededores', 'Profesionales que trabajan en los alrededores de Bella Vista.', 7);

-- Perfiles ficticios para que el directorio no quede vacío después de instalarlo.
-- No tienen propietario ni teléfono real y se identifican como demostración.
insert into public.professional_profiles (
  id, slug, display_name, headline, bio, experience_years, phone_preview,
  accent_color, service_mode, status, is_demo, views_count
) values
  ('10000000-0000-4000-8000-000000000001', 'diego-sosa-electricista', 'Diego Sosa', 'Electricista', 'Electricista con experiencia en instalaciones, tableros y reparaciones del hogar. Trabajo prolijo y presupuesto claro antes de comenzar.', 9, '381 5•• ••01', 'forest', 'domicilio', 'published', true, 24),
  ('10000000-0000-4000-8000-000000000002', 'mariana-ruiz-pintora', 'Mariana Ruiz', 'Pintora y decoradora', 'Pintura de interiores y exteriores, tratamiento de humedad y terminaciones decorativas para hogares y comercios.', 7, '381 5•• ••02', 'sunset', 'domicilio', 'published', true, 18),
  ('10000000-0000-4000-8000-000000000003', 'carlos-farias-plomero', 'Carlos Farías', 'Plomero integral', 'Soluciones de plomería para pérdidas, baños, cocinas y termotanques. Atención en distintos barrios de Bella Vista.', 12, '381 5•• ••03', 'ocean', 'domicilio', 'published', true, 9),
  ('10000000-0000-4000-8000-000000000004', 'lucas-molina-carpintero', 'Lucas Molina', 'Carpintero', 'Diseño, fabricación y restauración de muebles. Trabajos a medida con visita previa para conversar la idea y los materiales.', 11, '381 5•• ••04', 'plum', 'ambos', 'published', true, 8),
  ('10000000-0000-4000-8000-000000000005', 'sofia-medina-jardineria', 'Sofía Medina', 'Jardinería y poda', 'Mantenimiento de jardines, poda responsable y armado de huertas para patios pequeños.', 5, '381 5•• ••05', 'forest', 'domicilio', 'published', true, 15),
  ('10000000-0000-4000-8000-000000000006', 'martin-rojas-refrigeracion', 'Martín Rojas', 'Técnico en refrigeración', 'Instalación y mantenimiento de aires acondicionados y diagnóstico de heladeras familiares.', 8, '381 5•• ••06', 'ocean', 'domicilio', 'published', true, 7);

insert into public.services (
  id, profile_id, slug, title, description, custom_service, pricing_mode, price_amount
) values
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'tableros-e-instalaciones', 'Tableros e instalaciones domiciliarias', 'Instalaciones, tableros y reparaciones eléctricas del hogar.', 'Tableros e instalaciones domiciliarias', 'from', 12500),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', 'pintura-de-hogares', 'Pintura de hogares y comercios', 'Interiores, exteriores, humedad y terminaciones decorativas.', null, 'fixed', 18000),
  ('20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000003', 'plomeria-integral', 'Plomería integral', 'Pérdidas, baños, cocinas y termotanques.', null, 'hourly', 10500),
  ('20000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000004', 'restauracion-de-muebles', 'Restauración de muebles antiguos', 'Fabricación y restauración de muebles a medida.', 'Restauración de muebles antiguos', 'quote', null),
  ('20000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000005', 'jardineria-y-huertas', 'Jardinería y huertas familiares', 'Mantenimiento, poda y huertas para patios pequeños.', 'Huertas familiares', 'from', 8000),
  ('20000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000006', 'refrigeracion-del-hogar', 'Refrigeración del hogar', 'Aires acondicionados y heladeras familiares.', null, 'from', 15000);

insert into public.service_categories (service_id, category_id) values
  ('20000000-0000-4000-8000-000000000001', 'electricidad'),
  ('20000000-0000-4000-8000-000000000002', 'pintura'),
  ('20000000-0000-4000-8000-000000000003', 'plomeria'),
  ('20000000-0000-4000-8000-000000000004', 'carpinteria'),
  ('20000000-0000-4000-8000-000000000005', 'jardineria'),
  ('20000000-0000-4000-8000-000000000006', 'refrigeracion'),
  ('20000000-0000-4000-8000-000000000006', 'electricidad');

insert into public.profile_zones (profile_id, zone_id) values
  ('10000000-0000-4000-8000-000000000001', 'centro'), ('10000000-0000-4000-8000-000000000001', 'los-pinos'), ('10000000-0000-4000-8000-000000000001', 'villa-nueva'),
  ('10000000-0000-4000-8000-000000000002', 'los-pinos'), ('10000000-0000-4000-8000-000000000002', 'centro'), ('10000000-0000-4000-8000-000000000002', 'santa-rita'),
  ('10000000-0000-4000-8000-000000000003', 'villa-nueva'), ('10000000-0000-4000-8000-000000000003', 'centro'), ('10000000-0000-4000-8000-000000000003', 'san-ramon'),
  ('10000000-0000-4000-8000-000000000004', 'el-mollar'), ('10000000-0000-4000-8000-000000000004', 'alrededores'), ('10000000-0000-4000-8000-000000000004', 'centro'),
  ('10000000-0000-4000-8000-000000000005', 'la-esperanza'), ('10000000-0000-4000-8000-000000000005', 'santa-rita'), ('10000000-0000-4000-8000-000000000005', 'centro'),
  ('10000000-0000-4000-8000-000000000006', 'centro'), ('10000000-0000-4000-8000-000000000006', 'villa-nueva'), ('10000000-0000-4000-8000-000000000006', 'alrededores');

create or replace function public.handle_auth_user_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (id, email, name)
  values (new.id, coalesce(new.email, ''), coalesce(nullif(new.raw_user_meta_data->>'name', ''), split_part(coalesce(new.email, 'usuario'), '@', 1)))
  on conflict (id) do update set
    email = excluded.email,
    name = excluded.name,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists listoficios_auth_user_change on auth.users;
create trigger listoficios_auth_user_change
after insert or update of email, raw_user_meta_data on auth.users
for each row execute function public.handle_auth_user_change();

insert into public.user_profiles (id, email, name)
select id, coalesce(email, ''), coalesce(nullif(raw_user_meta_data->>'name', ''), split_part(coalesce(email, 'usuario'), '@', 1))
from auth.users
on conflict (id) do update set email = excluded.email, name = excluded.name, updated_at = now();

create or replace function public.save_professional_profile(p_user_id uuid, p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.professional_profiles%rowtype;
  v_service public.services%rowtype;
begin
  if not exists (select 1 from public.user_profiles where id = p_user_id and banned = false) then
    raise exception 'USER_NOT_ALLOWED';
  end if;

  select * into v_profile from public.professional_profiles where user_id = p_user_id;
  if v_profile.id is null then
    insert into public.professional_profiles (
      user_id, slug, display_name, headline, bio, experience_years,
      phone_ciphertext, phone_iv, phone_preview, service_mode, status
    ) values (
      p_user_id, p_payload->>'slug', p_payload->>'display_name', p_payload->>'headline', p_payload->>'bio',
      (p_payload->>'experience_years')::integer, p_payload->>'phone_ciphertext', p_payload->>'phone_iv',
      p_payload->>'phone_preview', (p_payload->>'service_mode')::public.service_mode, 'published'
    ) returning * into v_profile;
  else
    update public.professional_profiles set
      display_name = p_payload->>'display_name',
      headline = p_payload->>'headline',
      bio = p_payload->>'bio',
      experience_years = (p_payload->>'experience_years')::integer,
      phone_ciphertext = p_payload->>'phone_ciphertext',
      phone_iv = p_payload->>'phone_iv',
      phone_preview = p_payload->>'phone_preview',
      service_mode = (p_payload->>'service_mode')::public.service_mode,
      status = 'published',
      updated_at = now()
    where id = v_profile.id returning * into v_profile;
  end if;

  delete from public.profile_zones where profile_id = v_profile.id;
  insert into public.profile_zones (profile_id, zone_id)
  select v_profile.id, z.id
  from public.zones z
  where z.name in (select jsonb_array_elements_text(coalesce(p_payload->'zones', '[]'::jsonb)));

  select * into v_service from public.services where profile_id = v_profile.id order by created_at limit 1;
  if v_service.id is null then
    insert into public.services (profile_id, slug, title, description, custom_service, pricing_mode, price_amount, published)
    values (
      v_profile.id,
      coalesce(nullif(p_payload->>'service_slug', ''), 'servicio'),
      p_payload->>'headline',
      p_payload->>'bio',
      nullif(p_payload->>'custom_service', ''),
      (p_payload->>'pricing_mode')::public.pricing_mode,
      case when p_payload->>'pricing_mode' = 'quote' then null else nullif(p_payload->>'price_amount', '')::integer end,
      true
    ) returning * into v_service;
  else
    update public.services set
      title = p_payload->>'headline',
      description = p_payload->>'bio',
      custom_service = nullif(p_payload->>'custom_service', ''),
      pricing_mode = (p_payload->>'pricing_mode')::public.pricing_mode,
      price_amount = case when p_payload->>'pricing_mode' = 'quote' then null else nullif(p_payload->>'price_amount', '')::integer end,
      published = true,
      updated_at = now()
    where id = v_service.id returning * into v_service;
  end if;

  delete from public.service_categories where service_id = v_service.id;
  insert into public.service_categories (service_id, category_id)
  select v_service.id, c.id
  from public.categories c
  where c.id in (select jsonb_array_elements_text(coalesce(p_payload->'categories', '[]'::jsonb)));

  return jsonb_build_object('profileId', v_profile.id, 'slug', v_profile.slug, 'serviceId', v_service.id, 'status', v_profile.status);
end;
$$;

create or replace function public.save_professional_service(p_user_id uuid, p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_service public.services%rowtype;
  v_count integer;
  v_slug text;
begin
  select id into v_profile_id from public.professional_profiles where user_id = p_user_id;
  if v_profile_id is null then raise exception 'PROFILE_REQUIRED'; end if;
  select count(*) into v_count from public.services where profile_id = v_profile_id;

  if nullif(p_payload->>'id', '') is not null then
    select * into v_service from public.services where id = (p_payload->>'id')::uuid and profile_id = v_profile_id;
    if v_service.id is null then raise exception 'NOT_FOUND'; end if;
    update public.services set
      title = p_payload->>'title', description = p_payload->>'description',
      custom_service = nullif(p_payload->>'custom_service', ''),
      pricing_mode = (p_payload->>'pricing_mode')::public.pricing_mode,
      price_amount = case when p_payload->>'pricing_mode' = 'quote' then null else nullif(p_payload->>'price_amount', '')::integer end,
      published = coalesce((p_payload->>'published')::boolean, true), updated_at = now()
    where id = v_service.id returning * into v_service;
  else
    if v_count >= 8 then raise exception 'SERVICE_LIMIT'; end if;
    v_slug := p_payload->>'slug';
    if exists (select 1 from public.services where profile_id = v_profile_id and slug = v_slug) then
      v_slug := v_slug || '-' || (v_count + 1)::text;
    end if;
    insert into public.services (profile_id, slug, title, description, custom_service, pricing_mode, price_amount, published)
    values (
      v_profile_id, v_slug, p_payload->>'title', p_payload->>'description', nullif(p_payload->>'custom_service', ''),
      (p_payload->>'pricing_mode')::public.pricing_mode,
      case when p_payload->>'pricing_mode' = 'quote' then null else nullif(p_payload->>'price_amount', '')::integer end,
      coalesce((p_payload->>'published')::boolean, true)
    ) returning * into v_service;
  end if;

  delete from public.service_categories where service_id = v_service.id;
  insert into public.service_categories (service_id, category_id)
  select v_service.id, c.id from public.categories c
  where c.id in (select jsonb_array_elements_text(coalesce(p_payload->'categories', '[]'::jsonb)));
  return to_jsonb(v_service);
end;
$$;

create or replace function public.delete_professional_service(p_user_id uuid, p_service_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare v_deleted uuid;
begin
  delete from public.services s
  using public.professional_profiles p
  where s.id = p_service_id and s.profile_id = p.id and p.user_id = p_user_id
  returning s.id into v_deleted;
  return v_deleted is not null;
end;
$$;

create or replace function public.increment_profile_view(p_profile_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profile_daily_stats (profile_id, day, views)
  values (p_profile_id, current_date, 1)
  on conflict (profile_id, day) do update set views = public.profile_daily_stats.views + 1;
  update public.professional_profiles set views_count = views_count + 1 where id = p_profile_id and status = 'published';
end;
$$;

create or replace function public.consume_rate_limit(
  p_key_hash text, p_action text, p_window_start timestamptz, p_expires_at timestamptz
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare v_count integer;
begin
  insert into public.rate_limits (key_hash, action, window_start, count, expires_at)
  values (p_key_hash, p_action, p_window_start, 1, p_expires_at)
  on conflict (key_hash, action, window_start)
  do update set count = public.rate_limits.count + 1
  returning count into v_count;
  return v_count;
end;
$$;

create or replace function public.moderate_content(
  p_admin_user_id uuid, p_target_type text, p_target_id text, p_action text, p_reason text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_target_type = 'review' then
    if p_action not in ('published', 'rejected', 'pending') then raise exception 'INVALID_ACTION'; end if;
    update public.reviews set status = p_action::public.review_status, moderation_note = p_reason, updated_at = now() where id = p_target_id::uuid;
  elsif p_target_type = 'report' then
    if p_action not in ('reviewing', 'resolved', 'dismissed') then raise exception 'INVALID_ACTION'; end if;
    update public.reports set status = p_action::public.report_status, resolved_by = p_admin_user_id,
      resolved_at = case when p_action in ('resolved', 'dismissed') then now() else null end, updated_at = now()
    where id = p_target_id::uuid;
  elsif p_target_type = 'profile' then
    if p_action not in ('published', 'paused', 'suspended') then raise exception 'INVALID_ACTION'; end if;
    update public.professional_profiles set status = p_action::public.profile_status, updated_at = now() where id = p_target_id::uuid;
  elsif p_target_type = 'support' then
    if p_action not in ('reviewing', 'resolved', 'closed') then raise exception 'INVALID_ACTION'; end if;
    update public.support_tickets set status = p_action::public.support_status, admin_notes = p_reason, updated_at = now() where id = p_target_id::uuid;
  elsif p_target_type = 'user' then
    if p_action not in ('ban', 'unban') then raise exception 'INVALID_ACTION'; end if;
    update public.user_profiles set banned = p_action = 'ban', ban_reason = case when p_action = 'ban' then p_reason else null end, updated_at = now()
    where id = p_target_id::uuid;
  else
    raise exception 'INVALID_ACTION';
  end if;
  insert into public.moderation_actions (admin_user_id, target_type, target_id, action, reason)
  values (p_admin_user_id, p_target_type, p_target_id, p_action, p_reason);
end;
$$;

-- Data API cerrada: la aplicacion accede solo con sb_secret_ desde Railway.
alter table public.user_profiles enable row level security;
alter table public.categories enable row level security;
alter table public.zones enable row level security;
alter table public.professional_profiles enable row level security;
alter table public.profile_zones enable row level security;
alter table public.services enable row level security;
alter table public.service_categories enable row level security;
alter table public.portfolio_items enable row level security;
alter table public.favorites enable row level security;
alter table public.contact_events enable row level security;
alter table public.reviews enable row level security;
alter table public.review_replies enable row level security;
alter table public.reports enable row level security;
alter table public.support_tickets enable row level security;
alter table public.notifications enable row level security;
alter table public.profile_daily_stats enable row level security;
alter table public.moderation_actions enable row level security;
alter table public.rate_limits enable row level security;

revoke all on all tables in schema public from anon, authenticated;
grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
revoke all on function public.save_professional_profile(uuid, jsonb) from public, anon, authenticated;
revoke all on function public.handle_auth_user_change() from public, anon, authenticated;
revoke all on function public.save_professional_service(uuid, jsonb) from public, anon, authenticated;
revoke all on function public.delete_professional_service(uuid, uuid) from public, anon, authenticated;
revoke all on function public.increment_profile_view(uuid) from public, anon, authenticated;
revoke all on function public.consume_rate_limit(text, text, timestamptz, timestamptz) from public, anon, authenticated;
revoke all on function public.moderate_content(uuid, text, text, text, text) from public, anon, authenticated;
grant execute on function public.save_professional_profile(uuid, jsonb) to service_role;
grant execute on function public.save_professional_service(uuid, jsonb) to service_role;
grant execute on function public.delete_professional_service(uuid, uuid) to service_role;
grant execute on function public.increment_profile_view(uuid) to service_role;
grant execute on function public.consume_rate_limit(text, text, timestamptz, timestamptz) to service_role;
grant execute on function public.moderate_content(uuid, text, text, text, text) to service_role;

commit;

-- Verificacion esperada: 8 categorias, 8 zonas y todas las tablas con RLS activo.
select
  (select count(*) from public.categories) as categories,
  (select count(*) from public.zones) as zones,
  (select count(*) from pg_tables where schemaname = 'public' and rowsecurity) as rls_tables;
