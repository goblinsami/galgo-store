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
- No hay politicas de escritura publica para productos o articulos.
- No hay politica publica de lectura, edicion o borrado para clics.

## Seed

El seed reproducible esta en:

```text
supabase/seed/seed.sql
```

Crea cinco productos ficticios realistas y dos articulos en espanol con relaciones en `article_products`.
