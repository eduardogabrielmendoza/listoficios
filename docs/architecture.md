# Arquitectura

Las páginas renderizadas en servidor consultan `src/data` directamente. Los Route Handlers de `src/app/api/v1` atienden interacciones del navegador; el servidor no hace solicitudes HTTP contra sí mismo.

PostgreSQL concentra identidad y dominio. Better Auth administra `user`, `session`, `account` y `verification`; Drizzle define el marketplace y sus migraciones. Los perfiles demo se cargan con `npm run db:seed`, no tienen propietario y están marcados con `is_demo`.

Adaptadores principales:

- `src/db`: conexión, esquema, migración y seed.
- `src/lib/server/storage.ts`: Bucket privado compatible con S3.
- `src/lib/server/crypto.ts`: cifrado de teléfonos y hashes no reversibles.
- `src/lib/server/rate-limit.ts`: límites persistentes con fallback de desarrollo.
- `src/lib/server/api-response.ts`: contratos y logs estructurados.

La PWA solo cachea archivos estáticos versionados. No cachea HTML, APIs, panel, cuentas ni respuestas privadas.
