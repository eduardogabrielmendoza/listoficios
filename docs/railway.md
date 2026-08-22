# Despliegue manual en Railway

1. Creá un proyecto desde el repositorio de GitHub.
2. Agregá PostgreSQL y vinculá `DATABASE_URL` al servicio web.
3. Agregá un Bucket en la misma región y copiá sus credenciales S3.
4. Configurá `APP_URL` y `BETTER_AUTH_URL` con el dominio HTTPS definitivo.
5. Generá secretos distintos para `BETTER_AUTH_SECRET` y `CONTACT_ENCRYPTION_KEY`; la segunda debe contener 32 bytes en base64.
6. Configurá `ADMIN_EMAILS` con correos separados por coma.
7. Railway leerá `railway.toml`, migrará antes del despliegue, iniciará el servidor standalone y consultará `/api/health`.
8. En el primer despliegue ejecutá una vez `npm run db:seed`.

Variables requeridas: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `APP_URL`, `CONTACT_ENCRYPTION_KEY`, `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `ADMIN_EMAILS`.

Antes de publicar, fijá límites de gasto, verificá que aplicación/base/Bucket estén en la misma región, probá los flujos críticos y ensayá una restauración de backup en una base separada.

Railway cobra por consumo. Esta arquitectura prioriza simplicidad operativa, no un nivel gratuito permanente.
