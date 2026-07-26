# Galgo Store

MVP de una web de afiliacion especializada en productos para galgos. La aplicacion usa Nuxt, Vue 3, TypeScript estricto y Supabase/PostgreSQL para publicar productos, guias y registrar clics afiliados sin exponer claves privadas.

## Requisitos

- Node.js 24 o compatible con la version instalada de Nuxt.
- npm.
- Una cuenta o proyecto Supabase.
- Supabase CLI si quieres ejecutar el entorno local.

## Instalacion

```bash
npm install
cp .env.example .env
```

Completa `.env` con:

```env
NUXT_PUBLIC_SUPABASE_URL=
NUXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NUXT_ADMIN_EMAIL=admin@example.com
NUXT_PUBLIC_SITE_URL=http://localhost:3000
NUXT_PUBLIC_AMAZON_AFFILIATE_TAG=
```

`SUPABASE_SERVICE_ROLE_KEY` solo se usa en endpoints de servidor protegidos. `NUXT_ADMIN_EMAIL` no es publica y debe coincidir exactamente con el email del administrador.

El nombre visible de la tienda se centraliza en `app.config.ts`, dentro de `project.storeName`.

## Supabase

Para Supabase local, instala la CLI y ejecuta:

```bash
supabase start
supabase db reset
```

Para un proyecto remoto, aplica la migracion de `supabase/migrations/20260725183000_initial_affiliate_mvp.sql` desde la CLI o el SQL editor. Despues ejecuta `supabase/seed/seed.sql`.

## Panel de administracion

El panel esta en `/admin` y usa Supabase Auth con email y contrasena. Crea manualmente el usuario administrador desde Supabase Auth, configura su email exacto en `NUXT_ADMIN_EMAIL` y entra por `/admin/login`.

Las rutas protegidas redirigen a `/admin/login` si no hay sesion. Si la sesion pertenece a otro email, el servidor rechaza el acceso. Las escrituras de productos y guias pasan por `/api/admin/**`, llaman primero a `requireAdmin(event)` y despues usan la service role key solo en servidor.

Los borradores se guardan con `published = false`; las rutas publicas siguen leyendo solo registros publicados. Un futuro agente puede crear borradores en Supabase respetando el esquema y las reglas de contenido para que un humano los revise en el panel antes de publicar.

## Desarrollo

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
```

La app muestra un aviso de configuracion si faltan `NUXT_PUBLIC_SUPABASE_URL` o `NUXT_PUBLIC_SUPABASE_ANON_KEY`.

## Sustituir enlaces afiliados ficticios

Los productos seed usan URLs como:

```text
https://www.amazon.es/dp/ASIN_EJEMPLO_1?tag=AFFILIATE_TAG
```

Sustituye `ASIN_EJEMPLO_X` y `AFFILIATE_TAG` por valores reales cuando tengas una fuente autorizada. No anadas precios, descuentos, valoraciones ni pruebas si no existen datos verificables.
