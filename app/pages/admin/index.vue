<template>
  <section>
    <div class="admin-page-heading">
      <div>
        <p class="eyebrow">Resumen</p>
        <h1>Panel de administracion</h1>
      </div>
      <div class="admin-actions">
        <NuxtLink class="button" to="/admin/productos/nuevo">Crear producto</NuxtLink>
        <NuxtLink class="button button-secondary" to="/admin/guias/nueva">Crear guia</NuxtLink>
      </div>
    </div>

    <div class="admin-metrics">
      <article class="admin-metric">
        <span>Total productos</span>
        <strong>{{ dashboard?.products.total ?? 0 }}</strong>
      </article>
      <article class="admin-metric">
        <span>Productos publicados</span>
        <strong>{{ dashboard?.products.published ?? 0 }}</strong>
      </article>
      <article class="admin-metric">
        <span>Productos en borrador</span>
        <strong>{{ dashboard?.products.draft ?? 0 }}</strong>
      </article>
      <article class="admin-metric">
        <span>Total guias</span>
        <strong>{{ dashboard?.articles.total ?? 0 }}</strong>
      </article>
      <article class="admin-metric">
        <span>Guias publicadas</span>
        <strong>{{ dashboard?.articles.published ?? 0 }}</strong>
      </article>
      <article class="admin-metric">
        <span>Guias en borrador</span>
        <strong>{{ dashboard?.articles.draft ?? 0 }}</strong>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { AdminDashboard } from '~~/shared/utils/admin-content'

definePageMeta({
  layout: 'admin',
})

const { $adminFetch } = useNuxtApp()
const { data: dashboard } = await useFetch<AdminDashboard>('/api/admin/dashboard', {
  $fetch: $adminFetch,
})
</script>
