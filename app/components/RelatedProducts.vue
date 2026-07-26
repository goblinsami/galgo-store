<template>
  <section v-if="products.length" class="section">
    <div class="container">
      <p class="eyebrow">Productos relacionados</p>
      <h2>Tambien puede interesarte</h2>
      <ProductGrid :products="products" />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Product } from '~~/shared/types/database'

defineProps<{
  products: Product[]
}>()
</script>
