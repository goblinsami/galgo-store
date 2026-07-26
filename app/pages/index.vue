<template>
  <div>
    <section class="hero">
      <div class="container hero-content">
        <p class="eyebrow">Recomendaciones para galgos</p>
        <h1>{{ storeName }}</h1>
        <p class="lead">
          Una web de afiliacion especializada en productos practicos para galgos: arneses, abrigos, camas y guias para decidir con medidas reales.
        </p>
        <div class="hero-actions">
          <NuxtLink class="button" to="/productos">Ver productos</NuxtLink>
          <NuxtLink class="button button-secondary" to="/guias">Leer guias</NuxtLink>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <ConfigWarning v-if="homeData?.configMissing" />
        <AffiliateDisclosure />
      </div>
    </section>

    <section class="section section-muted">
      <div class="container">
        <p class="eyebrow">Destacados</p>
        <h2>Productos recomendados</h2>
        <ProductGrid :products="homeData?.products ?? []" />
      </div>
    </section>

    <section class="section">
      <div class="container">
        <p class="eyebrow">Guias</p>
        <h2>Lecturas utiles para empezar</h2>
        <div v-if="homeData?.articles.length" class="grid grid-3">
          <ArticleCard v-for="article in homeData.articles" :key="article.id" :article="article" />
        </div>
        <EmptyState v-else title="No hay guias publicadas" message="Las guias apareceran aqui cuando Supabase este configurado y tenga contenido publicado." />
      </div>
    </section>

    <section class="section section-muted">
      <div class="container">
        <p class="eyebrow">Categorias principales</p>
        <h2>Compra pensando en la forma del galgo</h2>
        <div class="grid grid-3">
          <NuxtLink v-for="category in mainCategories" :key="category.value" class="card card-body" :to="`/productos?categoria=${category.value}`">
            <span class="tag">{{ category.label }}</span>
            <h3>{{ category.title }}</h3>
            <p>{{ category.description }}</p>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { createCanonicalUrl } from '~~/shared/utils/seo'

const repository = useContentRepository()
const config = useRuntimeConfig()
const { storeName } = useProjectConfig()
const canonical = createCanonicalUrl(String(config.public.siteUrl), '/')

const { data: homeData } = await useAsyncData('home-content', async () => {
  const [products, articles] = await Promise.all([
    repository.getFeaturedProducts(),
    repository.getFeaturedArticles(),
  ])

  return {
    products: products.data,
    articles: articles.data,
    configMissing: products.configMissing || articles.configMissing,
  }
})

const mainCategories = [
  {
    value: 'arneses',
    label: 'Arneses',
    title: 'Sujecion segura',
    description: 'Opciones pensadas para cuerpos estrechos y primeros paseos con ajuste cuidadoso.',
  },
  {
    value: 'abrigos',
    label: 'Abrigos',
    title: 'Paseos con frio',
    description: 'Prendas sencillas para lluvia, viento y perros que necesitan cobertura extra.',
  },
  {
    value: 'camas',
    label: 'Camas',
    title: 'Descanso amplio',
    description: 'Superficies generosas para galgos que suelen dormir completamente estirados.',
  },
] as const

useSeoMeta({
  title: () => `${storeName.value} | Productos y guias para galgos`,
  description: 'Recomendaciones editoriales de productos para galgos con guias utiles, aviso de afiliacion y fichas sin precios inventados.',
  ogTitle: () => storeName.value,
  ogDescription: 'Productos y guias para elegir accesorios de galgos con transparencia.',
  ogType: 'website',
  ogUrl: canonical,
})

useHead({
  link: [{ rel: 'canonical', href: canonical }],
})
</script>
