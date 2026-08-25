-- LISTOFICIOS / MOTION V2 Y SCROLL GLOBAL
-- Ejecutar una sola vez en Supabase > SQL Editor, después de 0003.
-- Incremental: conserva textos y versiones anteriores, completando solo valores faltantes.

begin;

update public.site_config_versions
set config = jsonb_set(
  jsonb_set(config, '{schemaVersion}', '3'::jsonb, true),
  '{motion}',
  jsonb_build_object(
    'enabled', true,
    'smoothScrollEnabled', true,
    'storyEyebrow', 'De una necesidad a una solución',
    'needText', 'Necesito alguien que pueda…',
    'searchText', 'Arreglar una pérdida de agua',
    'compareText', 'Compará experiencia, zonas y forma de trabajo.',
    'contactText', 'Hola, vi tu perfil en Listoficios…',
    'finalText', 'Hablá directamente, sin intermediarios.',
    'servicesEyebrow', 'Un mapa de posibilidades',
    'servicesTitle', 'Servicios cerca tuyo',
    'servicesNeedText', 'Empezá por lo que necesitás resolver.',
    'servicesCategoriesText', 'Hay oficios para cada necesidad.',
    'servicesZonesText', 'Cobertura local en Bella Vista.',
    'servicesClarityText', 'Más información para decidir con tranquilidad.'
  ) || coalesce(config->'motion', '{}'::jsonb),
  true
), updated_at = now()
where coalesce((config->>'schemaVersion')::integer, 1) < 3
   or not (coalesce(config->'motion', '{}'::jsonb) ?& array[
     'smoothScrollEnabled', 'servicesEyebrow', 'servicesTitle', 'servicesNeedText',
     'servicesCategoriesText', 'servicesZonesText', 'servicesClarityText'
   ]);

commit;

select
  version,
  status,
  config->>'schemaVersion' as schema_version,
  config->'motion'->>'smoothScrollEnabled' as smooth_scroll,
  config->'motion'->>'servicesTitle' as services_title
from public.site_config_versions
order by version desc;
