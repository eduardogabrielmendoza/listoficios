# Arquitectura

Las páginas renderizadas en servidor consultan `src/data` directamente. Los Route Handlers de `src/app/api/v1` atienden interacciones del navegador; el servidor no hace solicitudes HTTP contra sí mismo.

Supabase se usa como PostgreSQL administrado, no como sistema de autenticación. Better Auth administra las tablas `user`, `session`, `account` y `verification`; Drizzle define el marketplace y sus migraciones. Los perfiles demo opcionales se cargan con `npm run db:seed`, no tienen propietario y están marcados con `is_demo`.

Cloudinary almacena la galería. El navegador nunca recibe las credenciales: las cargas pasan por la API de Listoficios, Sharp valida el contenido, elimina metadatos, limita dimensiones y genera WebP. PostgreSQL conserva el `public_id` de Cloudinary y las rutas públicas de Listoficios resuelven la URL de entrega.

Adaptadores principales:

- `src/db`: conexión, esquema, migración y seed.
- `src/lib/server/storage.ts`: carga, entrega y eliminación en Cloudinary.
- `src/lib/server/crypto.ts`: cifrado de teléfonos y hashes no reversibles.
- `src/lib/server/rate-limit.ts`: límites persistentes con fallback de desarrollo.
- `src/lib/server/api-response.ts`: contratos y logs estructurados.

La PWA solo cachea archivos estáticos versionados. No cachea HTML, APIs, panel, cuentas ni respuestas privadas.
