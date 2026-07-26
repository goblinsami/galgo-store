<template>
  <article class="card product-card">
    <NuxtLink :to="`/productos/${product.slug}`" class="product-media" :aria-label="`Ver ${product.name}`">
      <img v-if="product.imageUrl" :src="product.imageUrl" :alt="product.name" loading="lazy">
      <ImagePlaceholder v-else :label="`Imagen pendiente de ${product.name}`" />
    </NuxtLink>
    <div class="card-body">
      <span class="tag">{{ PRODUCT_CATEGORY_LABELS[product.category] }}</span>
      <h2>
        <NuxtLink :to="`/productos/${product.slug}`">{{ product.name }}</NuxtLink>
      </h2>
      <p>{{ product.shortDescription }}</p>
      <NuxtLink class="button button-secondary" :to="`/productos/${product.slug}`">Ver ficha</NuxtLink>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Product } from '~~/shared/types/database'
import { PRODUCT_CATEGORY_LABELS } from '~~/shared/utils/categories'

defineProps<{
  product: Product
}>()
</script>
