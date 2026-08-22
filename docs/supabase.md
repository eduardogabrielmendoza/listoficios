# Configuración de Supabase

Listoficios usa Supabase exclusivamente como PostgreSQL. Las cuentas continúan en Better Auth; no habilites Supabase Auth ni crees tablas manualmente desde el editor visual.

## Alta inicial

1. Creá un proyecto gratuito y guardá la contraseña de la base.
2. Abrí `SQL Editor` y ejecutá completo [`drizzle/0000_plain_nekra.sql`](../drizzle/0000_plain_nekra.sql). Hacelo una sola vez sobre una base vacía.
3. Abrí `Connect`, elegí `Session pooler` y copiá la URI del puerto `5432`.
4. Reemplazá `[YOUR-PASSWORD]` por la contraseña, conservando el usuario con el identificador del proyecto.
5. Guardá esa URI como `DATABASE_URL` en Railway.
6. Verificá la conexión ejecutando `npm run db:check`.

Formato orientativo:

```text
postgresql://postgres.PROJECT_REF:TU_PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres?sslmode=require
```

Si la contraseña contiene caracteres como `@`, `:`, `/`, `#` o `%`, codificala para URL antes de colocarla en la cadena.

## Datos iniciales

El SQL ya crea las tablas, claves foráneas, índices, categorías y zonas. También activa RLS sin políticas públicas para impedir que la Data API de Supabase exponga el dominio. No crea usuarios ni contraseñas. Para sumar perfiles ficticios de desarrollo podés ejecutar, con `CONTACT_ENCRYPTION_KEY` configurada:

```bash
npm run db:seed
```

No ejecutes después `npm run db:migrate` sobre la base configurada manualmente: el SQL ya aplicó esa migración. Railway usa `npm run db:check` antes de desplegar. Las migraciones futuras se entregarán también como SQL incremental.

## Seguridad

La aplicación accede a PostgreSQL únicamente desde el servidor. No expongas `DATABASE_URL` ni la contraseña en variables `NEXT_PUBLIC_*`. El acceso y la autorización se controlan en Better Auth, repositorios y Route Handlers.
