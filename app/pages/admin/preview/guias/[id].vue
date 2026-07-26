<template>
  <div>
    <article v-if="article" class="section">
      <div class="container admin-preview-bar">
        <AdminStatusBadge :published="article.published" />
        <NuxtLink class="button button-secondary" :to="`/admin/guias/${article.id}`">Editar</NuxtLink>
      </div>

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

    <RelatedProducts :products="relatedProducts" />
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~~/shared/types/database'
import type { AdminArticle } from '~~/shared/utils/admin-content'

definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const [{ data: article }, { data: products }] = await Promise.all([
  useFetch<AdminArticle>(`/api/admin/articles/${route.params.id}`),
  useFetch<Product[]>('/api/admin/products', { default: () => [] }),
])

const relatedProducts = computed(() => {
  if (!article.value) {
    return []
  }

  return article.value.relatedProducts
    .map((id) => (products.value ?? []).find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product))
})

const formattedDate = computed(() => {
  if (!article.value?.publishedAt) {
    return ''
  }

  return new Intl.DateTimeFormat('es-ES', { dateStyle: 'long' }).format(new Date(article.value.publishedAt))
})

useSeoMeta({
  title: () => article.value ? `Preview: ${article.value.title}` : 'Preview guia',
  robots: 'noindex, nofollow',
})
</script>
