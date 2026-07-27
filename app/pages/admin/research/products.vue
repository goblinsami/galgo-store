<template>
  <section>
    <div class="admin-page-heading">
      <div>
        <p class="eyebrow">Investigacion</p>
        <h1>Candidatos Amazon</h1>
      </div>
    </div>

    <form class="admin-research-toolbar" @submit.prevent="runResearch">
      <input v-model="query" class="admin-input" type="search" placeholder="Buscar en Amazon Espana">
      <select v-model="category" class="admin-input">
        <option value="">Inferir categoria</option>
        <option v-for="item in PRODUCT_CATEGORIES" :key="item" :value="item">
          {{ PRODUCT_CATEGORY_LABELS[item] }}
        </option>
      </select>
      <input v-model.number="limit" class="admin-input" type="number" min="1" max="10" aria-label="Limite">
      <button class="button" type="submit" :disabled="pending">
        {{ pending ? 'Buscando...' : 'Ejecutar busqueda' }}
      </button>
    </form>

    <div v-if="errorMessage" class="admin-alert admin-alert-error">{{ errorMessage }}</div>
    <div v-if="successMessage" class="admin-alert admin-alert-success">{{ successMessage }}</div>

    <div v-if="run?.mode === 'fixture'" class="admin-alert admin-alert-warning">
      Datos fixture: sirven para probar el flujo, no son resultados reales de Amazon.
    </div>

    <div class="admin-filters">
      <select v-model="queryFilter" class="admin-input">
        <option value="all">Todas las busquedas</option>
        <option v-for="item in queryOptions" :key="item" :value="item">{{ item }}</option>
      </select>
      <select v-model="categoryFilter" class="admin-input">
        <option value="all">Todas las categorias</option>
        <option v-for="item in PRODUCT_CATEGORIES" :key="item" :value="item">
          {{ PRODUCT_CATEGORY_LABELS[item] }}
        </option>
      </select>
    </div>

    <div class="admin-table-wrap admin-research-table">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>ASIN</th>
            <th>Precio</th>
            <th>Adecuacion</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="candidate in filteredCandidates" :key="candidate.id">
            <td>
              <div class="admin-research-product">
                <img v-if="candidate.imageUrl" :src="candidate.imageUrl" :alt="candidate.title">
                <div v-else class="admin-research-placeholder">Sin imagen</div>
                <div>
                  <strong>{{ candidate.title }}</strong>
                  <small>{{ candidate.query }} · {{ PRODUCT_CATEGORY_LABELS[candidate.category] }}</small>
                  <small>{{ candidate.availability ?? 'Disponibilidad desconocida' }}</small>
                </div>
              </div>
            </td>
            <td>{{ candidate.asin }}</td>
            <td>
              <span>{{ formatPrice(candidate) }}</span>
              <small>{{ formatDate(candidate.price.retrievedAt) }}</small>
            </td>
            <td>
              <strong>{{ candidate.suitabilityScore }}/100</strong>
              <ul>
                <li v-for="reason in candidate.suitabilityReasons.slice(0, 3)" :key="reason">{{ reason }}</li>
                <li v-for="warning in candidate.suitabilityWarnings.slice(0, 2)" :key="warning" class="admin-warning-text">
                  {{ warning }}
                </li>
              </ul>
            </td>
            <td>{{ statusLabel(candidate.status) }}</td>
            <td class="admin-row-actions">
              <a :href="candidate.affiliateUrl" target="_blank" rel="nofollow sponsored noopener">Abrir</a>
              <button type="button" :disabled="candidate.status === 'imported'" @click="mark(candidate.id, 'approve')">Aprobar</button>
              <button type="button" :disabled="candidate.status === 'imported'" class="admin-mini-danger" @click="mark(candidate.id, 'reject')">Rechazar</button>
              <button type="button" :disabled="candidate.status === 'imported'" @click="importCandidate(candidate.id)">Importar borrador</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <EmptyState
      v-if="!filteredCandidates.length"
      title="No hay candidatos"
      message="Ejecuta una busqueda o ajusta los filtros."
    />
  </section>
</template>

<script setup lang="ts">
import type { ProductCategory } from '~~/shared/types/database'
import type { ProductCandidate, ProductResearchRun } from '~~/shared/types/product-research'
import { PRODUCT_CATEGORIES, PRODUCT_CATEGORY_LABELS } from '~~/shared/utils/categories'

definePageMeta({
  layout: 'admin',
})

const { $adminFetch } = useNuxtApp()
const adminRequest = $adminFetch as <T>(url: string, options?: { method?: string, body?: unknown }) => Promise<T>
const { data: run, refresh } = await useFetch<ProductResearchRun | null>('/api/admin/research/products', {
  default: () => null,
  $fetch: $adminFetch,
})

const query = ref('arnes antiescape galgo')
const category = ref<ProductCategory | ''>('')
const limit = ref(10)
const queryFilter = ref('all')
const categoryFilter = ref<ProductCategory | 'all'>('all')
const pending = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const queryOptions = computed(() => [...new Set((run.value?.candidates ?? []).map((candidate) => candidate.query))])
const filteredCandidates = computed(() => (run.value?.candidates ?? []).filter((candidate) => {
  const matchesQuery = queryFilter.value === 'all' || candidate.query === queryFilter.value
  const matchesCategory = categoryFilter.value === 'all' || candidate.category === categoryFilter.value
  return matchesQuery && matchesCategory
}))

function resetMessages() {
  errorMessage.value = ''
  successMessage.value = ''
}

async function runResearch() {
  resetMessages()
  pending.value = true
  try {
    run.value = await adminRequest<ProductResearchRun>('/api/admin/research/products/run', {
      method: 'POST',
      body: {
        query: query.value,
        category: category.value || undefined,
        limit: limit.value,
      },
    })
    successMessage.value = `Investigacion completada: ${run.value?.candidates.length ?? 0} candidatos.`
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'No se ha podido ejecutar la investigacion.'
  } finally {
    pending.value = false
  }
}

async function mark(candidateId: string, action: 'approve' | 'reject') {
  resetMessages()
  try {
    await adminRequest<ProductCandidate>(`/api/admin/research/products/${candidateId}/${action}`, { method: 'POST' })
    await refresh()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'No se ha podido actualizar el candidato.'
  }
}

async function importCandidate(candidateId: string) {
  resetMessages()
  try {
    const result = await adminRequest<{ productId: string, slug: string }>(`/api/admin/research/products/${candidateId}/import`, { method: 'POST' })
    successMessage.value = `Borrador creado: ${result.slug}.`
    await refresh()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'No se ha podido importar el candidato.'
  }
}

function formatPrice(candidate: ProductCandidate): string {
  if (candidate.price.amount === null || !candidate.price.currency) {
    return 'Sin precio'
  }

  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: candidate.price.currency }).format(candidate.price.amount)
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('es-ES', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
}

function statusLabel(status: ProductCandidate['status']): string {
  const labels = {
    candidate: 'Candidato',
    approved: 'Aprobado',
    rejected: 'Rechazado',
    imported: 'Importado',
  }
  return labels[status]
}
</script>
