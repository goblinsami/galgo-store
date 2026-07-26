# Architecture

## Flujo Nuxt a Supabase

Las paginas Nuxt usan SSR con `useAsyncData` y el composable `useContentRepository`. El repositorio obtiene un cliente Supabase anonimo mediante `@nuxtjs/supabase`, consulta solo contenido `published = true` y transforma filas snake_case en tipos frontend camelCase.

Si faltan variables publicas de Supabase, el repositorio devuelve datos vacios y `configMissing`, permitiendo desarrollar la interfaz sin exponer secretos ni romper el build.

## Capas de acceso a datos

- `shared/types/database.ts`: tipos de dominio y tipo `Database`.
- `shared/utils/mappers.ts`: transformacion de filas Supabase.
- `app/composables/useContentRepository.ts`: consultas reutilizables de productos, articulos y relaciones.
- `server/utils/supabase.ts`: cliente Supabase anonimo para endpoints Nitro.

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

Un agente futuro podria conectarse a una capa de administracion o funcion controlada para sugerir productos. Debe escribir borradores, no publicar automaticamente, y validar reglas de contenido antes de insertar datos.
