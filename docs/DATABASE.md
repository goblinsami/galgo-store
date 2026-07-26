# Database

La migracion principal esta en:

```text
supabase/migrations/20260725183000_initial_affiliate_mvp.sql
```

Incluye:

- Enum `product_category`.
- Tablas `products`, `articles`, `article_products` y `affiliate_clicks`.
- Defaults con `gen_random_uuid()` y `now()`.
- Funcion y triggers `set_updated_at`.
- Indices por slug, published, featured, category y created_at.
- RLS activa.

## Politicas publicas

- Visitantes anonimos leen productos publicados.
- Visitantes anonimos leen articulos publicados.
- Visitantes anonimos leen relaciones publicadas.
- Visitantes anonimos insertan clics afiliados.
- Usuarios autenticados mantienen esos mismos permisos publicos para que el administrador pueda navegar la web.
- No hay politicas de escritura publica para productos o articulos.
- No hay politica publica de lectura, edicion o borrado para clics.

## Escrituras administrativas

No hay politicas publicas de escritura para `products`, `articles` ni `article_products`. El panel administrativo escribe mediante endpoints Nitro protegidos por Supabase Auth y `NUXT_ADMIN_EMAIL`.

Cuando una operacion administrativa esta autorizada, el servidor usa `SUPABASE_SERVICE_ROLE_KEY` exclusivamente en backend. Esa clave no debe exponerse al navegador ni registrarse en logs.

## Borradores y publicacion

`products.published` y `articles.published` son booleanos:

- `false`: borrador visible solo en el panel y en previews admin protegidos.
- `true`: publicado visible en la web publica y en sitemap.

Los futuros agentes de contenido pueden crear registros con `published = false` para revision humana. Para relacionar guias con productos deben insertar filas en `article_products` con `sort_order` empezando en 1 y respetando productos existentes.

## Seed

El seed reproducible esta en:

```text
supabase/seed/seed.sql
```

Crea cinco productos ficticios realistas y dos articulos en espanol con relaciones en `article_products`.
