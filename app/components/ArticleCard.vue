<template>
  <article class="card article-card">
    <NuxtLink :to="`/guias/${article.slug}`" class="article-media" :aria-label="`Leer ${article.title}`">
      <img v-if="article.coverImageUrl" :src="article.coverImageUrl" :alt="article.title" loading="lazy">
      <ImagePlaceholder v-else text="Guia Galgo" :label="`Imagen pendiente de ${article.title}`" />
    </NuxtLink>
    <div class="card-body">
      <h2>
        <NuxtLink :to="`/guias/${article.slug}`">{{ article.title }}</NuxtLink>
      </h2>
      <p>{{ article.excerpt }}</p>
      <NuxtLink class="button button-secondary" :to="`/guias/${article.slug}`">Leer guia</NuxtLink>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Article } from '~~/shared/types/database'

defineProps<{
  article: Article
}>()
</script>
