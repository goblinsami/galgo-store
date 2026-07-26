<template>
  <div v-if="products.length" class="grid grid-3">
    <ProductCard v-for="product in products" :key="product.id" :product="product" />
  </div>
  <EmptyState v-else title="No hay productos publicados" message="Cuando haya recomendaciones disponibles apareceran aqui." />
</template>

<script setup lang="ts">
import type { Product } from '~~/shared/types/database'

defineProps<{
  products: Product[]
}>()
</script>
