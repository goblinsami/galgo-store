<template>
  <section>
    <div class="admin-page-heading">
      <div>
        <p class="eyebrow">Guias</p>
        <h1>Nueva guia</h1>
      </div>
    </div>
    <AdminArticleForm :initial-value="initialValue" :products="products ?? []" />
  </section>
</template>

<script setup lang="ts">
import type { Product } from '~~/shared/types/database'
import { emptyAdminArticlePayload } from '~~/shared/utils/admin-content'

definePageMeta({
  layout: 'admin',
})

const initialValue = emptyAdminArticlePayload()
const { $adminFetch } = useNuxtApp()
const { data: products } = await useFetch<Product[]>('/api/admin/products', {
  default: () => [],
  $fetch: $adminFetch,
})
</script>
