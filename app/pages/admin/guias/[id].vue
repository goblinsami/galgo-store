<template>
  <section>
    <div class="admin-page-heading">
      <div>
        <p class="eyebrow">Guias</p>
        <h1>Editar guia</h1>
      </div>
    </div>
    <AdminArticleForm
      v-if="article"
      :initial-value="articleToAdminPayload(article)"
      :products="products ?? []"
      :article-id="article.id"
    />
  </section>
</template>

<script setup lang="ts">
import type { Product } from '~~/shared/types/database'
import type { AdminArticle } from '~~/shared/utils/admin-content'
import { articleToAdminPayload } from '~~/shared/utils/admin-content'

definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const [{ data: article }, { data: products }] = await Promise.all([
  useFetch<AdminArticle>(`/api/admin/articles/${route.params.id}`),
  useFetch<Product[]>('/api/admin/products', { default: () => [] }),
])
</script>
