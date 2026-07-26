<template>
  <section v-if="articles.length" class="section section-muted">
    <div class="container">
      <p class="eyebrow">Guias relacionadas</p>
      <h2>Para decidir con mas contexto</h2>
      <div class="grid grid-3">
        <ArticleCard v-for="article in articles" :key="article.id" :article="article" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Article } from '~~/shared/types/database'

defineProps<{
  articles: Article[]
}>()
</script>
