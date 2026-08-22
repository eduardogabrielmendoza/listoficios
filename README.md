# Listoficios

Demo local de un marketplace de servicios para Bella Vista, Tucumán. Permite buscar y filtrar profesionales, explorar perfiles, iniciar un contacto demostrativo por WhatsApp, guardar favoritos, crear una cuenta local y publicar un servicio.

## Desarrollo

```bash
npm install
npm run dev
```

Verificación completa:

```bash
npm run lint
npm test
npm run test:e2e
npm run build
```

## Alcance actual

- Sin backend, base de datos, pagos, reservas ni mensajería interna.
- Cuenta local con PBKDF2; la contraseña no se guarda en texto plano.
- Datos demo en `localStorage` y sesión en `sessionStorage` o `localStorage`.
- General Sans 400, 500 y 600 alojada localmente desde la distribución oficial de Fontshare.
- La licencia de la fuente está documentada en `src/app/fonts/LICENSE.txt`.

Los perfiles, números telefónicos, galería y opiniones visibles son demostrativos.
