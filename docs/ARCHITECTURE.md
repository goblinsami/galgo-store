# Architecture

## Flujo Nuxt a Supabase

Las paginas Nuxt usan SSR con `useAsyncData` y el composable `useContentRepository`. El repositorio obtiene un cliente Supabase anonimo mediante `@nuxtjs/supabase`, consulta solo contenido `published = true` y transforma filas snake_case en tipos frontend camelCase.

Si faltan variables publicas de Supabase, el repositorio devuelve datos vacios y `configMissing`, permitiendo desarrollar la interfaz sin exponer secretos ni romper el build.

## Capas de acceso a datos

- `shared/types/database.ts`: tipos de dominio y tipo `Database`.
- `shared/utils/mappers.ts`: transformacion de filas Supabase.
- `app/composables/useContentRepository.ts`: consultas reutilizables de productos, articulos y relaciones.
- `server/utils/supabase.ts`: cliente Supabase anonimo para endpoints Nitro.
- `server/utils/admin.ts`: `requireAdmin(event)`, que valida sesion Supabase y email exacto contra `NUXT_ADMIN_EMAIL`.
- `shared/utils/admin-content.ts`: validacion de payloads, filtros y conversiones del panel.

## Administracion

El panel vive bajo `/admin/**`, tiene `noindex, nofollow` y queda fuera del sitemap. El middleware global redirige usuarios sin sesion a `/admin/login`; el servidor vuelve a comprobar autorizacion en cada endpoint administrativo.

El administrador se crea manualmente en Supabase Auth. La aplicacion no implementa registro, roles, tabla `admin_users` ni gestion de usuarios. Solo se permite el email configurado en `NUXT_ADMIN_EMAIL`, que permanece en `runtimeConfig` privado.

Las paginas admin nunca escriben directamente con permisos elevados desde el navegador. Para crear, editar o eliminar productos y guias llaman a endpoints internos:

- `/api/admin/products`
- `/api/admin/products/[id]`
- `/api/admin/articles`
- `/api/admin/articles/[id]`

Cada endpoint llama primero a `requireAdmin(event)`. Solo despues usa `SUPABASE_SERVICE_ROLE_KEY` en servidor para saltar RLS y realizar la operacion. Los errores devueltos son genericos y no incluyen sesiones ni claves.

Los previews protegidos (`/admin/preview/productos/[id]` y `/admin/preview/guias/[id]`) cargan registros por ID desde endpoints admin, por lo que pueden mostrar borradores sin exponerlos en las rutas publicas.

## Flujo del clic afiliado

1. El boton llama `POST /api/affiliate-click`.
2. El servidor valida payload con Zod.
3. Busca el producto publicado.
4. Valida que la URL sea HTTPS y que el host sea exactamente `amazon.es` o `www.amazon.es`.
5. Inserta un registro en `affiliate_clicks` con UTM, pagina de origen y referrer, sin IP completa ni datos personales.
6. Devuelve solo la URL afiliada y si el registro se pudo guardar.

Si la insercion falla temporalmente, el endpoint no bloquea la navegacion.

## SSR

Los listados y detalles usan `useAsyncData` para que el contenido principal no dependa solo de peticiones tras montar el cliente. Las paginas inexistentes devuelven 404 real cuando Supabase esta configurado.

## Futuro agente de contenido

Un agente futuro podria conectarse a una funcion controlada para sugerir productos o guias. Debe escribir borradores con `published = false`, no publicar automaticamente, y validar reglas de contenido antes de insertar datos.
