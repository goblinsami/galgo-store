<template>
  <section class="section">
    <div class="container">
      <div class="admin-preview-bar">
        <AdminStatusBadge v-if="product" :published="product.published" />
        <NuxtLink v-if="product" class="button button-secondary" :to="`/admin/productos/${product.id}`">Editar</NuxtLink>
      </div>

      <div v-if="product" class="detail-layout">
        <div class="card">
          <div class="product-media">
            <img v-if="product.imageUrl" :src="product.imageUrl" :alt="product.name">
            <ImagePlaceholder v-else :label="`Imagen pendiente de ${product.name}`" />
          </div>
        </div>
        <div class="detail-panel">
          <div>
            <span class="tag">{{ PRODUCT_CATEGORY_LABELS[product.category] }}</span>
            <h1 class="page-title">{{ product.name }}</h1>
            <p class="lead">{{ product.description }}</p>
          </div>

          <div v-if="product.recommendedFor" class="list-box">
            <h2>Para quien esta recomendado</h2>
            <p>{{ product.recommendedFor }}</p>
          </div>

          <div class="pros-cons">
            <div class="list-box">
              <h2>Ventajas</h2>
              <ul>
                <li v-for="item in product.pros" :key="item">{{ item }}</li>
              </ul>
            </div>
            <div class="list-box">
              <h2>Inconvenientes</h2>
              <ul>
                <li v-for="item in product.cons" :key="item">{{ item }}</li>
              </ul>
            </div>
          </div>

          <AffiliateDisclosure />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Product } from '~~/shared/types/database'
import { PRODUCT_CATEGORY_LABELS } from '~~/shared/utils/categories'

definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const { $adminFetch } = useNuxtApp()
const { data: product } = await useFetch<Product>(`/api/admin/products/${route.params.id}`, {
  $fetch: $adminFetch,
})

useSeoMeta({
  title: () => product.value ? `Preview: ${product.value.name}` : 'Preview producto',
  robots: 'noindex, nofollow',
})
</script>
