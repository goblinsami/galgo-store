<template>
  <section>
    <div class="admin-page-heading">
      <div>
        <p class="eyebrow">Productos</p>
        <h1>Editar producto</h1>
      </div>
    </div>
    <AdminProductForm v-if="product" :initial-value="productToAdminPayload(product)" :product-id="product.id" />
  </section>
</template>

<script setup lang="ts">
import type { Product } from '~~/shared/types/database'
import { productToAdminPayload } from '~~/shared/utils/admin-content'

definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const { $adminFetch } = useNuxtApp()
const { data: product } = await useFetch<Product>(`/api/admin/products/${route.params.id}`, {
  $fetch: $adminFetch,
})
</script>
