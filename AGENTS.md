# AGENTS

## Alcance del MVP

Este proyecto cubre una web publica de afiliacion para galgos: productos, fichas, guias, paginas legales iniciales, registro de clics afiliados y un panel minimo para un unico administrador.

No implementar sin una tarea explicita:

- Nuevas capacidades del panel de administracion fuera del CRUD minimo existente.
- Registro publico, multiples administradores, roles o gestion de usuarios.
- Automatizacion con IA.
- Publicacion en redes sociales.
- Scraping de Amazon.
- Precios dinamicos.
- Carrito, pagos o backend separado.

## Stack

- Nuxt estable actual.
- Vue 3.
- TypeScript estricto.
- Supabase y PostgreSQL.
- `@nuxtjs/supabase`.
- CSS propio.
- ESLint.
- Vitest.

## Arquitectura

- Las paginas consumen datos mediante composables/repositorios, no con consultas Supabase duplicadas por todas partes.
- Los productos y articulos salen de Supabase, nunca de Nuxt Content.
- El endpoint `/api/affiliate-click` valida payload, producto publicado y dominio Amazon Espana antes de devolver la URL.
- Las escrituras administrativas pasan por `/api/admin/**`, llaman a `requireAdmin(event)` y comprueban el email exacto de `NUXT_ADMIN_EMAIL`.
- No exponer `SUPABASE_SERVICE_ROLE_KEY` al cliente.
- No exponer `NUXT_ADMIN_EMAIL` al cliente.
- El Markdown debe renderizarse sanitizado.

## Comandos antes de completar una tarea

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

No declarar terminada una tarea si alguno falla.

## Reglas de contenido

- No inventar precios, descuentos, valoraciones, numero de resenas, certificaciones ni pruebas.
- No afirmar que un producto esta probado sin confirmacion.
- No hacer scraping de Amazon.
- No ofrecer diagnosticos ni recomendaciones veterinarias.
- Mantener visible el aviso de afiliacion.
- En admin, guardar borradores con `published = false` hasta revision humana.

## Reglas para futuros agentes de IA

Los agentes futuros deben proponer cambios pequenos, trazables y revisables. Cualquier alta de producto o guia debe diferenciar hechos verificables de criterio editorial, incluir fuente autorizada si hay datos comerciales, respetar RLS y las reglas de contenido, y crear borradores para revision salvo instruccion explicita de publicar.
