# Despliegue en Railway con Supabase y Cloudinary

Railway alojará únicamente Next.js. Supabase administrará cuentas y datos por HTTPS, y Cloudinary guardará las imágenes. No crees servicios Postgres ni Buckets en Railway.

## 1. Antes de desplegar

1. Ejecutá [`supabase/setup.sql`](../supabase/setup.sql) siguiendo [la guía de Supabase](supabase.md).
2. Creá o configurá Cloudinary y copiá `Cloud name`, `API key` y `API secret`.
3. Rotá cualquier secreto que haya aparecido en una captura o mensaje público.

Si ya ejecutaste `setup.sql` y Listoficios está funcionando, **no vuelvas a ejecutarlo**. Para incorporar foto de perfil, portada y la nueva galería sin borrar datos, ejecutá solamente [`supabase/migrations/0001_profile_media.sql`](../supabase/migrations/0001_profile_media.sql) desde el SQL Editor de Supabase.

### Migracion administrativa actual

Si la aplicacion ya esta funcionando, no vuelvas a ejecutar `setup.sql`. Desde Supabase > SQL Editor ejecuta, en este orden:

1. [`supabase/migrations/0001_profile_media.sql`](../supabase/migrations/0001_profile_media.sql), solamente si aun no fue aplicada.
2. [`supabase/migrations/0002_admin_cms_moderation.sql`](../supabase/migrations/0002_admin_cms_moderation.sql).
3. [`supabase/migrations/0003_home_motion.sql`](../supabase/migrations/0003_home_motion.sql).

La migracion `0002` es incremental: conserva cuentas, perfiles, servicios e imagenes. Agrega roles, cola de moderacion, reglas, revision manual de imagenes, CMS versionado y auditoria. Al terminar debe devolver una configuracion publicada y los perfiles existentes como aprobados.

La migración `0003` conserva todo el historial del CMS, actualiza su esquema y agrega el interruptor y los textos de la narrativa animada del home.

## 2. Variables del servicio web

En `Variables` del servicio de Listoficios cargá exactamente:

```text
APP_URL=https://listoficios.up.railway.app
ADMIN_EMAILS=tu-correo-real@ejemplo.com
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
CONTACT_ENCRYPTION_KEY=CLAVE_DE_32_BYTES_EN_BASE64
CLOUDINARY_CLOUD_NAME=TU_CLOUD_NAME
CLOUDINARY_API_KEY=TU_API_KEY
CLOUDINARY_API_SECRET=TU_API_SECRET
```

Eliminá estas variables antiguas si todavía aparecen:

- `DATABASE_URL`
- `BETTER_AUTH_URL`
- `BETTER_AUTH_SECRET`

Marcá como secretos `SUPABASE_SECRET_KEY`, `CONTACT_ENCRYPTION_KEY` y `CLOUDINARY_API_SECRET`. Las dos variables `NEXT_PUBLIC_SUPABASE_*` son públicas por diseño; la clave Publishable no concede acceso a las tablas protegidas por RLS.

Para generar `CONTACT_ENCRYPTION_KEY` en tu terminal:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

## 3. Configuración de despliegue

El repositorio ya fija Node.js 22 y `railway.toml` define:

- build: `npm run build` (incluye `public` y `.next/static` dentro de la salida standalone)
- start: `npm run start` (fuerza `HOSTNAME=0.0.0.0` y respeta el `PORT` de Railway)
- healthcheck: `/api/health`
- ningún comando de pre-deploy

En Railway, eliminá manualmente cualquier `Pre-deploy Command` que hayas agregado antes en `Settings > Deploy`. Debe quedar vacío; una configuración del panel puede tener prioridad sobre el archivo del repositorio.

## 4. Publicar y validar

Despues de desplegar, ingresa con el correo configurado en `ADMIN_EMAILS`, abre `/admin` y confirma que `/admin/moderacion`, `/admin/imagenes` y `/admin/contenido` cargan sin el aviso de migracion pendiente.

1. Confirmá que Railway despliega la rama `main`.
2. Cargá las nueve variables.
3. Elegí `Redeploy` sobre el commit nuevo; si persiste una imagen antigua, usá la opción de limpiar caché.
4. Revisá `Build Logs`: debe completar `next build`.
5. Revisá `Deploy Logs`: ya no debe aparecer `db:check`, `db:migrate` ni una conexión PostgreSQL.
6. Abrí `https://listoficios.up.railway.app/api/health`.
7. Probá registro, ingreso, publicación y galería.

En la galería comprobá por separado la foto de perfil, la portada y una imagen de trabajo. Cloudinary conserva el original optimizado y Listoficios solicita un recorte distinto para avatar, portada, tarjeta, galería y vista ampliada.

`/api/health` es una comprobación de vida de Next.js y siempre responde `200` cuando el contenedor está listo. Para comprobar también Supabase, abrí:

```text
https://listoficios.up.railway.app/api/health?dependencies=1
```

Si allí aparece `database: "unavailable"` o `database: "not_configured"`, verificá los nombres exactos de las tres variables de Supabase y que el SQL haya terminado sin errores. Un valor que comienza con `https://` corresponde a `NEXT_PUBLIC_SUPABASE_URL`, nunca a `DATABASE_URL`.
