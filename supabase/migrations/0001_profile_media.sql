-- LISTOFICIOS / MEDIOS DE PERFIL
-- Ejecutar una sola vez en Supabase > SQL Editor.
-- Migracion incremental: conserva usuarios, perfiles, servicios e imagenes actuales.

begin;

alter table public.portfolio_items
  add column if not exists kind text not null default 'work',
  add column if not exists caption text not null default '',
  add column if not exists focal_x numeric(4,3) not null default 0.5,
  add column if not exists focal_y numeric(4,3) not null default 0.5,
  add column if not exists updated_at timestamptz not null default now();

alter table public.portfolio_items
  drop constraint if exists portfolio_items_kind_check,
  drop constraint if exists portfolio_items_focal_x_check,
  drop constraint if exists portfolio_items_focal_y_check;

alter table public.portfolio_items
  add constraint portfolio_items_kind_check check (kind in ('avatar', 'cover', 'work')),
  add constraint portfolio_items_focal_x_check check (focal_x between 0 and 1),
  add constraint portfolio_items_focal_y_check check (focal_y between 0 and 1);

create unique index if not exists portfolio_one_avatar_per_profile_idx
  on public.portfolio_items(profile_id) where kind = 'avatar';

create unique index if not exists portfolio_one_cover_per_profile_idx
  on public.portfolio_items(profile_id) where kind = 'cover';

create index if not exists portfolio_profile_kind_order_idx
  on public.portfolio_items(profile_id, kind, sort_order);

commit;

-- Verificacion: las imagenes anteriores deben figurar como "work".
select kind, count(*) as total
from public.portfolio_items
group by kind
order by kind;
