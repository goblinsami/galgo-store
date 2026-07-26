<template>
  <section>
    <div class="admin-page-heading">
      <div>
        <p class="eyebrow">Productos</p>
        <h1>Productos</h1>
      </div>
      <NuxtLink class="button" to="/admin/productos/nuevo">Crear producto</NuxtLink>
    </div>

    <div class="admin-filters">
      <input v-model="textFilter" class="admin-input" type="search" placeholder="Buscar">
      <select v-model="categoryFilter" class="admin-input">
        <option value="all">Todas las categorias</option>
        <option v-for="category in PRODUCT_CATEGORIES" :key="category" :value="category">
          {{ PRODUCT_CATEGORY_LABELS[category] }}
        </option>
      </select>
      <select v-model="statusFilter" class="admin-input">
        <option value="all">Todos los estados</option>
        <option value="published">Publicados</option>
        <option value="draft">Borradores</option>
      </select>
    </div>

    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Categoria</th>
            <th>Estado</th>
            <th>Destacado</th>
            <th>Actualizado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in filteredProducts" :key="product.id">
            <td>{{ product.name }}</td>
            <td>{{ PRODUCT_CATEGORY_LABELS[product.category] }}</td>
            <td><AdminStatusBadge :published="product.published" /></td>
            <td>{{ product.featured ? 'Si' : 'No' }}</td>
            <td>{{ formatDate(product.updatedAt) }}</td>
            <td class="admin-row-actions">
              <NuxtLink :to="`/admin/productos/${product.id}`">Editar</NuxtLink>
              <NuxtLink :to="`/admin/preview/productos/${product.id}`">Previsualizar</NuxtLink>
              <button type="button" @click="toggleProduct(product)">{{ product.published ? 'Borrador' : 'Publicar' }}</button>
              <button type="button" class="admin-link-danger" @click="productToDelete = product">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <EmptyState v-if="!filteredProducts.length" title="No hay productos" message="Ajusta los filtros o crea un producto nuevo." />

    <AdminConfirmDialog
      :open="Boolean(productToDelete)"
      title="Eliminar producto"
      :message="`Se eliminara ${productToDelete?.name ?? 'este producto'}.`"
      @cancel="productToDelete = null"
      @confirm="deleteProduct"
    />
  </section>
</template>

<script setup lang="ts">
import type { Product, ProductCategory } from '~~/shared/types/database'
import type { AdminStatusFilter } from '~~/shared/utils/admin-content'
import { filterAdminProducts, productToAdminPayload } from '~~/shared/utils/admin-content'
import { PRODUCT_CATEGORIES, PRODUCT_CATEGORY_LABELS } from '~~/shared/utils/categories'

definePageMeta({
  layout: 'admin',
})

const { data: products, refresh } = await useFetch<Product[]>('/api/admin/products', { default: () => [] })
const textFilter = ref('')
const categoryFilter = ref<ProductCategory | 'all'>('all')
const statusFilter = ref<AdminStatusFilter>('all')
const productToDelete = ref<Product | null>(null)

const filteredProducts = computed(() => filterAdminProducts(products.value, {
  text: textFilter.value,
  category: categoryFilter.value,
  status: statusFilter.value,
}))

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' }).format(new Date(value))
}

async function toggleProduct(product: Product) {
  await $fetch(`/api/admin/products/${product.id}`, {
    method: 'PUT',
    body: {
      ...productToAdminPayload(product),
      published: !product.published,
    },
  })
  await refresh()
}

async function deleteProduct() {
  if (!productToDelete.value) {
    return
  }

  await $fetch(`/api/admin/products/${productToDelete.value.id}`, { method: 'DELETE' })
  productToDelete.value = null
  await refresh()
}
</script>
