# API interna V1

Las respuestas exitosas usan `{ "data": ..., "meta": { "requestId": "..." } }`. Los errores usan `{ "error": { "code", "message", "fieldErrors?", "requestId" } }`.

## Público

- `GET /api/v1/professionals`: `q`, `category`, `zone`, `pricing`, `sort`, `cursor`, `limit`.
- `GET /api/v1/professionals/:slug`: perfil público sin teléfono.
- `GET /api/v1/services/:slug`: servicio público.
- `POST /api/v1/professionals/:id/contact`: registra el evento y devuelve WhatsApp o llamada.
- `POST /api/v1/professionals/:id/view`: métrica limitada y anonimizada.
- `POST /api/v1/reports`: reporte anónimo o autenticado.
- `POST /api/v1/support`: consulta de soporte.
- `GET /api/health`: salud de aplicación y Supabase Data API.

## Cuenta autenticada

- `GET/PATCH /api/v1/me/profile`
- `GET/POST/PATCH/DELETE /api/v1/me/services`
- `POST/DELETE /api/v1/favorites/:professionalId`
- `GET /api/v1/me/favorites`
- `POST/PATCH /api/v1/reviews`
- `POST /api/v1/reviews/:id/reply`
- `POST/DELETE /api/v1/media`
- `GET /api/v1/me/analytics`
- `GET/PATCH /api/v1/me/notifications`

## Administración

- `GET /api/v1/admin/overview`
- `PATCH /api/v1/admin/moderation`

El servidor vuelve a comprobar sesión, rol y propiedad en cada mutación. La navegación del cliente nunca se considera autorización.
