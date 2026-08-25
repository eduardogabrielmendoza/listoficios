-- LISTOFICIOS / HOME MOTION V1
-- Ejecutar una sola vez en Supabase > SQL Editor, después de 0002.
-- Incremental: conserva todas las versiones y agrega defaults seguros.

begin;

update public.site_config_versions
set config = jsonb_set(
  jsonb_set(config, '{schemaVersion}', '2'::jsonb, true),
  '{motion}',
  jsonb_build_object(
    'enabled', true,
    'storyEyebrow', 'De una necesidad a una solución',
    'needText', 'Necesito alguien que pueda…',
    'searchText', 'Arreglar una pérdida de agua',
    'compareText', 'Compará experiencia, zonas y forma de trabajo.',
    'contactText', 'Hola, vi tu perfil en Listoficios…',
    'finalText', 'Hablá directamente, sin intermediarios.'
  ) || coalesce(config->'motion', '{}'::jsonb),
  true
), updated_at = now()
where coalesce((config->>'schemaVersion')::integer, 1) < 2
   or not (config ? 'motion');

commit;

select version, status, config->>'schemaVersion' as schema_version,
  config->'motion'->>'enabled' as motion_enabled
from public.site_config_versions
order by version desc;
