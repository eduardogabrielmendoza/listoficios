# Configuración de Supabase

Listoficios usa Supabase Auth para cuentas y la Data API HTTPS para datos. No hace falta copiar una contraseña PostgreSQL, usar `DATABASE_URL`, configurar Auth Hooks ni crear un pooler.

## 1. Instalar las tablas

1. Abrí tu proyecto de Supabase.
2. Entrá en `SQL Editor` y elegí `New query`.
3. Copiá completo [`supabase/setup.sql`](../supabase/setup.sql), pegalo y presioná `Run`.
4. Al final debe aparecer una fila con `categories = 8`, `zones = 8` y `rls_tables = 18`.

El instalador elimina y vuelve a crear solamente las tablas públicas de Listoficios. No elimina usuarios de `auth.users`, pero sí borra datos anteriores del marketplace. Ejecutalo una sola vez para esta migración; no lo vuelvas a ejecutar sobre datos reales.

## 2. Configurar el correo

1. Abrí `Authentication > Providers > Email`.
2. Dejá habilitado el acceso con email y contraseña.
3. Para esta V1, desactivá `Confirm email`; todavía no configuramos un proveedor de correo.
4. Abrí `Authentication > URL Configuration`.
5. En `Site URL` colocá `https://listoficios.up.railway.app`.
6. En `Redirect URLs` agregá:
   - `https://listoficios.up.railway.app/**`
   - `http://localhost:3000/**`

Si cambia el dominio de Railway, actualizá estas dos entradas.

## 3. Copiar las tres credenciales

Abrí `Project Settings > API Keys` y copiá:

- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- clave `Publishable` con prefijo `sb_publishable_` → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- clave `Secret` con prefijo `sb_secret_` → `SUPABASE_SECRET_KEY`

La clave secreta omite RLS y solo debe existir en Railway y `.env.local`. Nunca le agregues `NEXT_PUBLIC_`, nunca la pegues en código y nunca la compartas en capturas. No uses la antigua clave JWT `service_role` si tu proyecto ya ofrece claves Secret.

## 4. Comprobar

Después de cargar las variables y desplegar:

1. Visitá `/api/health`; debe responder `ok` para la aplicación.
2. Visitá `/api/health?dependencies=1`; debe mostrar `database: "supabase_data_api"`.
3. Creá una cuenta desde `/crear-cuenta`.
4. En Supabase, comprobá el usuario en `Authentication > Users`.
5. En `Table Editor > user_profiles`, comprobá que el trigger creó su perfil.

No hace falta ejecutar ningún comando de base de datos desde Railway. Las tablas ya quedaron instaladas desde SQL Editor.
