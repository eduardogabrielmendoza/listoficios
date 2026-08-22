# Despliegue en Railway con Supabase y Cloudinary

Railway alojará solamente la aplicación Next.js. PostgreSQL vivirá en Supabase y las imágenes en Cloudinary; no hace falta crear un servicio Postgres ni un Bucket dentro de Railway.

## 1. Preparar servicios externos

1. Creá el proyecto gratuito de Supabase y seguí [la configuración SQL](supabase.md).
2. Creá una cuenta de Cloudinary.
3. En la consola de Cloudinary copiá `Cloud name`, `API key` y `API secret`.
4. Conservá todas estas credenciales fuera del repositorio.

## 2. Variables de Railway

Configurá en el servicio web:

```text
APP_URL=https://TU-DOMINIO.up.railway.app
BETTER_AUTH_URL=https://TU-DOMINIO.up.railway.app
BETTER_AUTH_SECRET=UN_SECRETO_ALEATORIO_DE_32_CARACTERES_O_MAS
ADMIN_EMAILS=tu-correo@ejemplo.com
DATABASE_URL=URI_SESSION_POOLER_DE_SUPABASE
CONTACT_ENCRYPTION_KEY=CLAVE_DE_32_BYTES_EN_BASE64
CLOUDINARY_CLOUD_NAME=TU_CLOUD_NAME
CLOUDINARY_API_KEY=TU_API_KEY
CLOUDINARY_API_SECRET=TU_API_SECRET
```

No agregues prefijo `NEXT_PUBLIC_` a secretos, base de datos ni credenciales de Cloudinary.

Para crear valores seguros localmente:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

Usá la salida hexadecimal para `BETTER_AUTH_SECRET` y la salida base64 para `CONTACT_ENCRYPTION_KEY`.

## 3. Corregir y desplegar

El repositorio fija Node.js 22 mediante `package.json`, `.nvmrc` y `nixpacks.toml`. Esto corrige el error de Railway donde Nixpacks elegía Node 18.20.5 aunque Next.js 16 requiere Node 20.9 o superior.

1. Conectá el repositorio de GitHub al servicio Railway.
2. Confirmá que la rama desplegada sea `main`.
3. Cargá todas las variables anteriores.
4. En Supabase, ejecutá el SQL antes del primer despliegue.
5. Lanzá un nuevo deployment. Si Railway conserva la imagen anterior, elegí `Redeploy` con limpieza de caché.
6. Comprobá `/api/health` y luego registro, ingreso, publicación y carga de galería.

Railway leerá `railway.toml`, ejecutará `npm run db:check`, iniciará la salida standalone y consultará `/api/health`.

## 4. Datos demo opcionales

Con la aplicación vinculada y los secretos configurados, podés ejecutar una vez `npm run db:seed` desde un entorno conectado a Supabase. El seed usa números ficticios y marca esos perfiles como demostrativos.

Antes de publicar, fijá alertas de uso en los tres proveedores, probá los flujos críticos y guardá una copia del esquema SQL.
