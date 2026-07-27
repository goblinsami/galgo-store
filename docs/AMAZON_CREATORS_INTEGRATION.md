# Amazon Creators API integration

Esta integracion conecta Galgo Store con Amazon Espana mediante Amazon Creators API. No usa PA-API 5.0, no scrapea Amazon y no descarga imagenes.

## Documentacion oficial consultada

- Creators API introduction: https://affiliate-program.amazon.com/creatorsapi/docs/
- Using cURL and OAuth 2.0: https://affiliate-program.amazon.com/creatorsapi/docs/en-us/get-started/using-curl
- Common request headers and parameters: https://affiliate-program.amazon.com/creatorsapi/docs/en-us/concepts/common-request-headers-and-parameters
- SearchItems: https://affiliate-program.amazon.com/creatorsapi/docs/en-us/api-reference/operations/search-items
- GetItems: https://affiliate-program.amazon.com/creatorsapi/docs/en-us/api-reference/operations/get-items
- Migration from PA-API: https://affiliate-program.amazon.com/creatorsapi/docs/en-us/migrating-to-creatorsapi-from-paapi

## Onboarding

1. Registrar la cuenta en Amazon Afiliados para Espana.
2. Obtener el tracking ID de Asociados para el marketplace espanol.
3. Solicitar acceso a Creators API desde Associates Central.
4. Crear credenciales de Creators API y anotar Credential ID, Credential Secret y Credential Version.

Amazon documenta OAuth 2.0 client credentials. Para credenciales europeas v3.2 el token endpoint es `https://api.amazon.co.uk/auth/o2/token`; para v2.2 es `https://creatorsapi.auth.eu-south-2.amazoncognito.com/oauth2/token`. Las llamadas de catalogo usan `https://creatorsapi.amazon/catalog/v1/searchItems` y `https://creatorsapi.amazon/catalog/v1/getItems`.

## Variables

```env
AMAZON_CREATORS_ENABLED=false
AMAZON_CREATORS_MODE=fixture
AMAZON_CREATORS_MARKETPLACE=amazon.es
AMAZON_ASSOCIATE_TAG=
AMAZON_CREATORS_CREDENTIAL_ID=
AMAZON_CREATORS_CREDENTIAL_SECRET=
AMAZON_CREATORS_CREDENTIAL_VERSION=3.2
AMAZON_CREATORS_MAX_RESULTS=10
AMAZON_CREATORS_TIMEOUT_MS=12000
AMAZON_CREATORS_RETRIES=2
```

Ninguna credencial se expone en `runtimeConfig.public`.

## Marketplace

La primera version solo permite Amazon Espana. Internamente se guarda `marketplace: "amazon.es"` y la moneda esperada es `EUR` cuando Amazon la devuelve. Para las llamadas a Creators API se envia `www.amazon.es` en la cabecera `x-marketplace` y en el parametro `marketplace`.

## Ejecucion fixture

```bash
npm run research:amazon -- --query "arnes antiescape galgo" --limit 10
```

Con `AMAZON_CREATORS_MODE=fixture` se usan respuestas sanitizadas incluidas en `server/services/product-research/fixtures`. La pantalla admin muestra un aviso para no confundir esos datos con resultados reales.

## Ejecucion real

Configura `AMAZON_CREATORS_MODE=live`, `AMAZON_CREATORS_ENABLED=true`, `AMAZON_ASSOCIATE_TAG`, `AMAZON_CREATORS_CREDENTIAL_ID`, `AMAZON_CREATORS_CREDENTIAL_SECRET` y `AMAZON_CREATORS_CREDENTIAL_VERSION`.

La integracion solicita token OAuth, cachea el token hasta antes de su expiracion y llama a:

- `POST https://creatorsapi.amazon/catalog/v1/searchItems`
- `POST https://creatorsapi.amazon/catalog/v1/getItems`

Las peticiones usan `Content-Type: application/json`, `Authorization: Bearer ...` y `x-marketplace: www.amazon.es`.

## Resultados

Cada investigacion se guarda en:

- `data/product-research/runs/{runId}.json`
- `data/product-research/latest.json`

La escritura es atomica: se escribe un temporal, se valida y luego se reemplaza el archivo final.

## Imagenes, precios y enlaces

Solo se guardan URLs de imagen que llegan desde Creators API. No se descargan ni se suben a Supabase.

El precio se guarda como:

```ts
{
  amount: number | null
  currency: string | null
  retrievedAt: string
}
```

Los enlaces afiliados deben venir de Creators API. Antes de importar se valida `amazon.es`, ASIN y `AMAZON_ASSOCIATE_TAG` cuando esta configurado.

## Ranking

El ranking aplica:

- 40 % adecuacion para lebreles.
- 20 % coincidencia con la busqueda.
- 15 % calidad y cantidad de informacion.
- 10 % valoracion y resenas si existen.
- 10 % disponibilidad y precio verificable.
- 5 % imagen y ficha.

La deduplicacion se hace por ASIN, ASIN padre, marca/modelo y URL canonica disponible.

## Panel administrativo

La pantalla `/admin/research/products` permite ejecutar busquedas, filtrar por busqueda o categoria, revisar ASIN, imagen, precio, disponibilidad, razones, advertencias, abrir Amazon, aprobar, rechazar e importar como borrador.

No se puede publicar desde esa pantalla.

## Importacion

El cliente envia solo `candidateId`. El servidor lee `latest.json`, valida procedencia, ASIN, marketplace y enlace afiliado, genera un slug unico y crea un producto en Supabase con `published = false`.

El esquema actual de `products` no tiene columnas para ASIN ni procedencia. Por eso esos datos se conservan en JSON local y se incluyen en la descripcion del borrador, sin crear migraciones nuevas.

## Errores y limites

La integracion contempla credenciales ausentes, acceso denegado, rate limit, timeout, respuestas parciales, productos sin imagen, productos sin precio, ASIN invalido, marketplace incorrecto, duplicados y errores de mapeo. Un producto fallido no invalida toda la investigacion.

La suite normal usa mocks y fixtures; no llama a Amazon.

## Limitaciones

- La llamada real no queda verificada hasta disponer de credenciales validas.
- La importacion no conserva ASIN/procedencia en columnas dedicadas porque el esquema actual no las tiene.
- No hay crawling ni scraping de Amazon.
- No se crean productos publicados automaticamente.
