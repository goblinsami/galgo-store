<template>
  <section>
    <div class="admin-page-heading">
      <div>
        <p class="eyebrow">Guias</p>
        <h1>Guias</h1>
      </div>
      <NuxtLink class="button" to="/admin/guias/nueva">Crear guia</NuxtLink>
    </div>

    <div class="admin-filters">
      <input v-model="textFilter" class="admin-input" type="search" placeholder="Buscar">
      <select v-model="statusFilter" class="admin-input">
        <option value="all">Todos los estados</option>
        <option value="published">Publicadas</option>
        <option value="draft">Borradores</option>
      </select>
    </div>

    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Titulo</th>
            <th>Estado</th>
            <th>Destacada</th>
            <th>Publicacion</th>
            <th>Actualizado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="article in filteredArticles" :key="article.id">
            <td>{{ article.title }}</td>
            <td><AdminStatusBadge :published="article.published" /></td>
            <td>{{ article.featured ? 'Si' : 'No' }}</td>
            <td>{{ article.publishedAt ? formatDate(article.publishedAt) : 'Sin fecha' }}</td>
            <td>{{ formatDate(article.updatedAt) }}</td>
            <td class="admin-row-actions">
              <NuxtLink :to="`/admin/guias/${article.id}`">Editar</NuxtLink>
              <NuxtLink :to="`/admin/preview/guias/${article.id}`">Previsualizar</NuxtLink>
              <button type="button" @click="toggleArticle(article)">{{ article.published ? 'Borrador' : 'Publicar' }}</button>
              <button type="button" class="admin-link-danger" @click="articleToDelete = article">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <EmptyState v-if="!filteredArticles.length" title="No hay guias" message="Ajusta los filtros o crea una guia nueva." />

    <AdminConfirmDialog
      :open="Boolean(articleToDelete)"
      title="Eliminar guia"
      :message="`Se eliminara ${articleToDelete?.title ?? 'esta guia'}.`"
      @cancel="articleToDelete = null"
      @confirm="deleteArticle"
    />
  </section>
</template>

<script setup lang="ts">
import type { Article } from '~~/shared/types/database'
import type { AdminArticle, AdminStatusFilter } from '~~/shared/utils/admin-content'
import { articleToAdminPayload, filterAdminArticles } from '~~/shared/utils/admin-content'

definePageMeta({
  layout: 'admin',
})

const { data: articles, refresh } = await useFetch<Article[]>('/api/admin/articles', { default: () => [] })
const textFilter = ref('')
const statusFilter = ref<AdminStatusFilter>('all')
const articleToDelete = ref<Article | null>(null)

const filteredArticles = computed(() => filterAdminArticles(articles.value, {
  text: textFilter.value,
  status: statusFilter.value,
}))

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' }).format(new Date(value))
}

async function toggleArticle(article: Article) {
  const detail = await $fetch<AdminArticle>(`/api/admin/articles/${article.id}`)
  await $fetch(`/api/admin/articles/${article.id}`, {
    method: 'PUT',
    body: {
      ...articleToAdminPayload(detail),
      published: !article.published,
    },
  })
  await refresh()
}

async function deleteArticle() {
  if (!articleToDelete.value) {
    return
  }

  await $fetch(`/api/admin/articles/${articleToDelete.value.id}`, { method: 'DELETE' })
  articleToDelete.value = null
  await refresh()
}
</script>
