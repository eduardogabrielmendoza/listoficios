# Listoficios

Marketplace local de servicios para Bella Vista, Tucumán. Permite buscar y contactar profesionales sin cuenta, y ofrece cuentas reales para publicaciones, servicios, galería, favoritos, opiniones y administración.

## Stack

- Next.js 16, React 19 y TypeScript
- PostgreSQL y Drizzle ORM
- Better Auth con cookies `httpOnly`
- Railway Bucket mediante API S3 privada
- Zod, React Hook Form, Sharp
- Vitest, Testing Library y Playwright

## Desarrollo local

1. Copiá `.env.example` como `.env.local` y completá las variables.
2. Creá una base PostgreSQL vacía.
3. Ejecutá:

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Sin `DATABASE_URL`, las páginas públicas usan perfiles demo para revisión visual. Las cuentas, el panel y las escrituras requieren PostgreSQL.

## Verificación

```bash
npm run lint
npm test
npm run build
npm run test:e2e
npm run db:check
```

Los comandos de datos disponibles son `db:generate`, `db:migrate`, `db:seed`, `db:check` y `db:studio`.

## Seguridad

- Better Auth procesa las contraseñas; nunca se guardan en el navegador.
- Los teléfonos se cifran con AES-256-GCM y solo se descifran en la API de contacto.
- El Bucket es privado; las imágenes se convierten a WebP y se sirven por una ruta controlada.
- No se almacenan DNI, coordenadas exactas ni IP cruda.
- Las opiniones requieren contacto previo y moderación, pero no acreditan una contratación.

Consultá [la API](docs/api-v1.md), [el despliegue en Railway](docs/railway.md) y [la arquitectura](docs/architecture.md).
