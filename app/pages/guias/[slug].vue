<template>
  <div>
    <article v-if="article" class="section">
      <div class="narrow">
        <p class="eyebrow">Guia</p>
        <h1 class="page-title">{{ article.title }}</h1>
        <p class="lead">{{ article.excerpt }}</p>
        <p v-if="article.publishedAt">{{ formattedDate }}</p>
      </div>

      <div class="container section">
        <div class="article-media card">
          <img v-if="article.coverImageUrl" :src="article.coverImageUrl" :alt="article.title">
          <ImagePlaceholder v-else text="Guia Galgo" :label="`Imagen pendiente de ${article.title}`" />
        </div>
      </div>

      <div class="narrow">
        <AffiliateDisclosure />
        <SafeMarkdown :markdown="article.content" />
      </div>
    </article>

    <section v-else class="section">
      <div class="container">
        <ConfigWarning v-if="pageData?.configMissing" />
      </div>
    </section>

    <RelatedProducts :products="pageData?.products ?? []" />
  </div>
</template>

<script setup lang="ts">
import { createCanonicalUrl } from '~~/shared/utils/seo'

const route = useRoute()
const repository = useContentRepository()
const config = useRuntimeConfig()
const { storeName } = useProjectConfig()
const slug = computed(() => String(route.params.slug ?? ''))

const { data: pageData } = await useAsyncData(`article-${slug.value}`, async () => {
  const articleResult = await repository.getArticleBySlug(slug.value)
  const productsResult = articleResult.data
    ? await repository.getRelatedProductsForArticle(articleResult.data.id)
    : { data: [], error: null, configMissing: articleResult.configMissing }

  return {
    article: articleResult.data,
    products: productsResult.data,
    configMissing: articleResult.configMissing,
  }
})

if (pageData.value && !pageData.value.configMissing && !pageData.value.article) {
  throw createError({ statusCode: 404, statusMessage: 'Guia no encontrada', fatal: true })
}

const article = computed(() => pageData.value?.article ?? null)
const canonical = computed(() => createCanonicalUrl(String(config.public.siteUrl), `/guias/${slug.value}`))
const formattedDate = computed(() => {
  if (!article.value?.publishedAt) {
    return ''
  }

  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'long',
  }).format(new Date(article.value.publishedAt))
})

useSeoMeta({
  title: () => article.value?.metaTitle ? `${article.value.metaTitle} | ${storeName.value}` : `Guia | ${storeName.value}`,
  description: () => article.value?.metaDescription ?? article.value?.excerpt ?? 'Guia editorial para galgos.',
  ogTitle: () => article.value?.title ?? 'Guia para galgos',
  ogDescription: () => article.value?.excerpt ?? 'Guia editorial para galgos.',
  ogType: 'article',
  ogUrl: canonical,
})

useHead({
  link: [{ rel: 'canonical', href: canonical }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: computed(() => JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.value?.title,
        description: article.value?.excerpt,
        datePublished: article.value?.publishedAt,
        url: canonical.value,
      })),
    },
  ],
})
</script>
