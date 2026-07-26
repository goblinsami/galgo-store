<template>
  <form class="admin-form" @submit.prevent="save(false)">
    <p v-if="successMessage" class="admin-alert admin-alert-success">{{ successMessage }}</p>
    <p v-if="errorMessage" class="admin-alert admin-alert-error">{{ errorMessage }}</p>

    <div class="admin-form-grid">
      <label>
        Nombre
        <input v-model="state.name" class="admin-input" type="text" required @input="syncSlugFromName">
      </label>
      <label>
        Slug
        <input v-model="state.slug" class="admin-input" type="text" required @input="slugTouched = true">
      </label>
    </div>

    <label>
      Descripcion corta
      <textarea v-model="state.short_description" class="admin-input" rows="3" required />
    </label>

    <label>
      Descripcion
      <textarea v-model="state.description" class="admin-input" rows="7" required />
    </label>

    <div class="admin-form-grid">
      <label>
        Categoria
        <select v-model="state.category" class="admin-input" required>
          <option v-for="category in PRODUCT_CATEGORIES" :key="category" :value="category">
            {{ PRODUCT_CATEGORY_LABELS[category] }}
          </option>
        </select>
      </label>
      <label>
        Orden
        <input v-model.number="state.sort_order" class="admin-input" type="number" min="0" step="1">
      </label>
    </div>

    <label>
      URL afiliada de Amazon Espana
      <input v-model="state.affiliate_url" class="admin-input" type="url" required>
    </label>

    <label>
      URL de imagen
      <input v-model="imageUrl" class="admin-input" type="url">
    </label>

    <div class="admin-form-grid">
      <label>
        Ventajas, una por linea
        <textarea v-model="prosText" class="admin-input" rows="6" />
      </label>
      <label>
        Inconvenientes, uno por linea
        <textarea v-model="consText" class="admin-input" rows="6" />
      </label>
    </div>

    <label>
      Recomendado para
      <textarea v-model="recommendedFor" class="admin-input" rows="4" />
    </label>

    <div class="admin-checks">
      <label><input v-model="state.featured" type="checkbox"> Destacado</label>
      <label><input v-model="state.published" type="checkbox"> Publicado</label>
    </div>

    <AdminFormActions
      :submitting="submitting"
      :preview-to="productId ? `/admin/preview/productos/${productId}` : undefined"
      @save-draft="save(false)"
      @publish="save(true)"
      @cancel="cancel"
    />
  </form>
</template>

<script setup lang="ts">
import type { Product } from '~~/shared/types/database'
import type { AdminProductPayload } from '~~/shared/utils/admin-content'
import { adminProductPayloadSchema, hasUnsavedChanges, normalizeSlug } from '~~/shared/utils/admin-content'
import { PRODUCT_CATEGORIES, PRODUCT_CATEGORY_LABELS } from '~~/shared/utils/categories'

const props = defineProps<{
  initialValue: AdminProductPayload
  productId?: string
}>()

const state = reactive<AdminProductPayload>(structuredClone(props.initialValue))
const savedState = ref<AdminProductPayload>(structuredClone(props.initialValue))
const slugTouched = ref(Boolean(props.initialValue.slug))
const submitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const prosText = ref(props.initialValue.pros.join('\n'))
const consText = ref(props.initialValue.cons.join('\n'))
const imageUrl = ref(props.initialValue.image_url ?? '')
const recommendedFor = ref(props.initialValue.recommended_for ?? '')

const hasChanges = computed(() => hasUnsavedChanges(currentPayload(), savedState.value))

function splitLines(value: string): string[] {
  return value.split('\n').map((item) => item.trim()).filter(Boolean)
}

function currentPayload(published = state.published): AdminProductPayload {
  return {
    ...state,
    slug: normalizeSlug(state.slug),
    image_url: imageUrl.value.trim() || null,
    pros: splitLines(prosText.value),
    cons: splitLines(consText.value),
    recommended_for: recommendedFor.value.trim() || null,
    published,
  }
}

function syncSlugFromName() {
  if (!slugTouched.value) {
    state.slug = normalizeSlug(state.name)
  }
}

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as { data?: { statusMessage?: string, message?: string } }).data
    return data?.statusMessage ?? data?.message ?? 'No se ha podido guardar el producto.'
  }

  return 'No se ha podido guardar el producto.'
}

async function save(published: boolean) {
  if (submitting.value) {
    return
  }

  successMessage.value = ''
  errorMessage.value = ''
  const payload = currentPayload(published)
  const validation = adminProductPayloadSchema.safeParse(payload)

  if (!validation.success) {
    errorMessage.value = validation.error.issues[0]?.message ?? 'Revisa los campos del producto.'
    return
  }

  submitting.value = true
  try {
    const product = await $fetch<Product>(
      props.productId ? `/api/admin/products/${props.productId}` : '/api/admin/products',
      {
        method: props.productId ? 'PUT' : 'POST',
        body: validation.data,
      },
    )

    savedState.value = validation.data
    Object.assign(state, validation.data)
    successMessage.value = published ? 'Producto guardado y publicado.' : 'Borrador guardado.'

    if (!props.productId) {
      await navigateTo(`/admin/productos/${product.id}`)
    }
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    submitting.value = false
  }
}

async function cancel() {
  if (hasChanges.value && !window.confirm('Hay cambios sin guardar. ¿Quieres salir?')) {
    return
  }

  await navigateTo('/admin/productos')
}

function beforeUnload(event: BeforeUnloadEvent) {
  if (!hasChanges.value) {
    return
  }

  event.preventDefault()
  event.returnValue = ''
}

onMounted(() => window.addEventListener('beforeunload', beforeUnload))
onBeforeUnmount(() => window.removeEventListener('beforeunload', beforeUnload))
onBeforeRouteLeave(() => {
  if (!hasChanges.value) {
    return true
  }

  return window.confirm('Hay cambios sin guardar. ¿Quieres salir?')
})
</script>
