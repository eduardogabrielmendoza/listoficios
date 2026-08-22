# Listoficios

Marketplace local de servicios para Bella Vista, Tucumán. Permite buscar y contactar profesionales sin cuenta, y ofrece cuentas reales para publicaciones, servicios, galerías, favoritos, opiniones y administración.

## Stack

- Next.js 16, React 19, TypeScript y Node.js 22
- Supabase Auth y Supabase Data API
- Cloudinary para imágenes
- Zod, React Hook Form y Sharp
- Vitest, Testing Library y Playwright

No existe una conexión PostgreSQL directa desde Railway. La aplicación consume Supabase por HTTPS y las tablas se instalan manualmente con [`supabase/setup.sql`](supabase/setup.sql).

## Desarrollo local

1. Creá un proyecto de Supabase y ejecutá el SQL según [la guía](docs/supabase.md).
2. Copiá `.env.example` como `.env.local` y completá sus variables.
3. Ejecutá:

```bash
npm install
npm run dev
```

Sin credenciales de Supabase, las páginas públicas conservan los perfiles demo para revisión visual. Las cuentas, el panel y las escrituras requieren Supabase configurado.

## Verificación

```bash
npm run lint
npm test
npm run build
npm run test:e2e
```

## Seguridad

- Supabase Auth procesa contraseñas y mantiene la sesión en cookies.
- `SUPABASE_SECRET_KEY` y las credenciales de Cloudinary son exclusivamente de servidor.
- Row Level Security bloquea el acceso público directo a las tablas; las operaciones pasan por los Route Handlers de Listoficios.
- Los teléfonos se cifran con AES-256-GCM y solo se descifran al preparar un contacto.
- Las imágenes se validan, limpian de metadatos y convierten a WebP antes de subirlas a Cloudinary.
- No se almacenan DNI, coordenadas exactas ni IP cruda.

Consultá [la API](docs/api-v1.md), [Railway](docs/railway.md), [Supabase](docs/supabase.md) y [la arquitectura](docs/architecture.md).
