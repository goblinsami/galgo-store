<template>
  <section class="section">
    <div class="container">
      <p class="eyebrow">Guias</p>
      <h1 class="page-title">Guias para cuidar la decision</h1>
      <p class="lead">Articulos breves en espanol, publicados desde Supabase y preparados para relacionar productos sin promesas inventadas.</p>
      <ConfigWarning v-if="pageData?.configMissing" />
      <div v-if="pageData?.articles.length" class="grid grid-3">
        <ArticleCard v-for="article in pageData.articles" :key="article.id" :article="article" />
      </div>
      <EmptyState v-else title="No hay guias publicadas" message="Cuando haya articulos publicados apareceran aqui." />
    </div>
  </section>
</template>

<script setup lang="ts">
import { createCanonicalUrl } from '~~/shared/utils/seo'

const repository = useContentRepository()
const config = useRuntimeConfig()
const { storeName } = useProjectConfig()
const canonical = createCanonicalUrl(String(config.public.siteUrl), '/guias')

const { data: pageData } = await useAsyncData('articles', async () => {
  const result = await repository.getArticles()
  return {
    articles: result.data,
    configMissing: result.configMissing,
  }
})

useSeoMeta({
  title: () => `Guias para galgos | ${storeName.value}`,
  description: 'Guias editoriales para elegir productos de galgos con medidas, necesidades y transparencia de afiliacion.',
  ogTitle: 'Guias para galgos',
  ogDescription: 'Lecturas utiles para familias de galgos.',
  ogType: 'website',
  ogUrl: canonical,
})

useHead({
  link: [{ rel: 'canonical', href: canonical }],
})
</script>
