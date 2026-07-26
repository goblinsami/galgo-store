<template>
  <div>
    <section class="section">
      <div class="container">
        <ConfigWarning v-if="pageData?.configMissing" />
        <div v-if="product" class="detail-layout">
          <div class="card">
            <div class="product-media">
              <img v-if="product.imageUrl" :src="product.imageUrl" :alt="product.name">
              <ImagePlaceholder v-else :label="`Imagen pendiente de ${product.name}`" />
            </div>
          </div>
          <div class="detail-panel">
            <div>
              <span class="tag">{{ PRODUCT_CATEGORY_LABELS[product.category] }}</span>
              <h1 class="page-title">{{ product.name }}</h1>
              <p class="lead">{{ product.description }}</p>
            </div>

            <div v-if="product.recommendedFor" class="list-box">
              <h2>Para quien esta recomendado</h2>
              <p>{{ product.recommendedFor }}</p>
            </div>

            <div class="pros-cons">
              <div class="list-box">
                <h2>Ventajas</h2>
                <ul>
                  <li v-for="item in product.pros" :key="item">{{ item }}</li>
                </ul>
              </div>
              <div class="list-box">
                <h2>Inconvenientes</h2>
                <ul>
                  <li v-for="item in product.cons" :key="item">{{ item }}</li>
                </ul>
              </div>
            </div>

            <AffiliateDisclosure />
            <ExternalAffiliateButton :product-id="product.id" :affiliate-url="product.affiliateUrl" :source-page="`/productos/${product.slug}`" />
          </div>
        </div>
      </div>
    </section>

    <RelatedArticles :articles="pageData?.relatedArticles ?? []" />
  </div>
</template>

<script setup lang="ts">
import { PRODUCT_CATEGORY_LABELS } from '~~/shared/utils/categories'
import { createCanonicalUrl } from '~~/shared/utils/seo'

const route = useRoute()
const repository = useContentRepository()
const config = useRuntimeConfig()
const { storeName } = useProjectConfig()
const slug = computed(() => String(route.params.slug ?? ''))

const { data: pageData } = await useAsyncData(`product-${slug.value}`, async () => {
  const productResult = await repository.getProductBySlug(slug.value)
  const relatedResult = productResult.data
    ? await repository.getRelatedArticlesForProduct(productResult.data.id)
    : { data: [], error: null, configMissing: productResult.configMissing }

  return {
    product: productResult.data,
    relatedArticles: relatedResult.data,
    configMissing: productResult.configMissing,
  }
})

if (pageData.value && !pageData.value.configMissing && !pageData.value.product) {
  throw createError({ statusCode: 404, statusMessage: 'Producto no encontrado', fatal: true })
}

const product = computed(() => pageData.value?.product ?? null)
const canonical = computed(() => createCanonicalUrl(String(config.public.siteUrl), `/productos/${slug.value}`))

useSeoMeta({
  title: () => product.value ? `${product.value.name} | ${storeName.value}` : `Producto | ${storeName.value}`,
  description: () => product.value?.shortDescription ?? `Ficha de producto para galgos en ${storeName.value}.`,
  ogTitle: () => product.value?.name ?? 'Producto para galgos',
  ogDescription: () => product.value?.shortDescription ?? 'Ficha editorial de producto para galgos.',
  ogType: 'website',
  ogUrl: canonical,
})

useHead({
  link: [{ rel: 'canonical', href: canonical }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: computed(() => JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: product.value?.name,
        description: product.value?.shortDescription,
        url: canonical.value,
      })),
    },
  ],
})
</script>
