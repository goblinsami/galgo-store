<template>
  <section class="section">
    <div class="container">
      <p class="eyebrow">Productos</p>
      <h1 class="page-title">Productos para galgos</h1>
      <p class="lead">Recomendaciones publicadas desde Supabase, sin precios ni promesas no verificadas.</p>
      <ConfigWarning v-if="pageData?.configMissing" />
      <CategoryFilter :current-category="category" />
      <ProductGrid :products="pageData?.products ?? []" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { normalizeCategory } from '~~/shared/utils/categories'
import { createCanonicalUrl } from '~~/shared/utils/seo'

const route = useRoute()
const repository = useContentRepository()
const config = useRuntimeConfig()
const { storeName } = useProjectConfig()

const category = computed(() => normalizeCategory(route.query.categoria))
const canonicalPath = computed(() => category.value ? `/productos?categoria=${category.value}` : '/productos')
const canonical = computed(() => createCanonicalUrl(String(config.public.siteUrl), canonicalPath.value))

const { data: pageData } = await useAsyncData(
  () => `products-${category.value ?? 'all'}`,
  async () => {
    const result = await repository.getProducts(category.value)
    return {
      products: result.data,
      configMissing: result.configMissing,
    }
  },
  { watch: [category] },
)

useSeoMeta({
  title: () => category.value ? `Productos para galgos: ${category.value}` : `Productos para galgos | ${storeName.value}`,
  description: 'Listado de productos publicados para galgos con filtro por categoria y fichas individuales.',
  ogTitle: 'Productos para galgos',
  ogDescription: 'Recomendaciones editoriales para galgos desde Supabase.',
  ogType: 'website',
  ogUrl: canonical,
})

useHead({
  link: [{ rel: 'canonical', href: canonical }],
})
</script>
