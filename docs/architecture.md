# Arquitectura

Railway ejecuta únicamente la aplicación Next.js. Supabase ofrece cuentas y persistencia mediante Auth y Data API por HTTPS; Cloudinary almacena las imágenes. No hay conexión PostgreSQL directa, Drizzle, Better Auth, comandos de migración ni servicio Postgres en Railway.

Las páginas renderizadas en servidor consultan `src/data` directamente. Los Route Handlers de `src/app/api/v1` atienden interacciones del navegador. Ambos usan un cliente Supabase exclusivo del servidor con `SUPABASE_SECRET_KEY`; esta clave nunca llega al navegador.

La sesión del navegador utiliza el cliente público de Supabase y cookies renovadas por `src/proxy.ts`. Cada mutación vuelve a comprobar sesión, rol y propiedad en el servidor. RLS permanece activo y sin políticas públicas sobre las tablas de dominio, por lo que las claves públicas no pueden leerlas directamente.

Cloudinary recibe únicamente archivos que pasaron por la API de Listoficios. Sharp verifica el contenido, elimina metadatos, limita dimensiones y genera WebP. Supabase conserva el `public_id` y las rutas de Listoficios resuelven la entrega.

Adaptadores principales:

- `src/lib/supabase`: clientes de navegador, servidor, administración y renovación de sesión.
- `src/data`: consultas del marketplace y autorización de dominio.
- `src/lib/server/storage.ts`: carga, entrega y eliminación en Cloudinary.
- `src/lib/server/crypto.ts`: cifrado de teléfonos y hashes no reversibles.
- `src/lib/server/rate-limit.ts`: límites persistentes con fallback de desarrollo.
- `src/lib/server/api-response.ts`: contratos y logs estructurados.

El esquema se instala manualmente desde [`supabase/setup.sql`](../supabase/setup.sql). Los cambios futuros deberán agregarse como archivos SQL incrementales, sin volver a ejecutar el instalador destructivo sobre producción.
