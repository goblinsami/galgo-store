<template>
  <form class="admin-form" @submit.prevent="save(false)">
    <p v-if="successMessage" class="admin-alert admin-alert-success">{{ successMessage }}</p>
    <p v-if="errorMessage" class="admin-alert admin-alert-error">{{ errorMessage }}</p>

    <div class="admin-form-grid">
      <label>
        Titulo
        <input v-model="state.title" class="admin-input" type="text" required @input="syncSlugFromTitle">
      </label>
      <label>
        Slug
        <input v-model="state.slug" class="admin-input" type="text" required @input="slugTouched = true">
      </label>
    </div>

    <label>
      Extracto
      <textarea v-model="state.excerpt" class="admin-input" rows="3" required />
    </label>

    <label>
      Contenido Markdown
      <textarea v-model="state.content" class="admin-input admin-markdown-input" rows="14" required />
    </label>

    <AdminMarkdownPreview :markdown="state.content" />

    <label>
      URL de portada
      <input v-model="coverImageUrl" class="admin-input" type="url">
    </label>

    <div class="admin-form-grid">
      <label>
        Meta titulo
        <input v-model="metaTitle" class="admin-input" type="text">
        <small :class="{ 'admin-warning-text': metaTitle.length > 60 }">{{ metaTitle.length }}/70</small>
      </label>
      <label>
        Meta descripcion
        <textarea v-model="metaDescription" class="admin-input" rows="3" />
        <small :class="{ 'admin-warning-text': metaDescription.length > 155 }">{{ metaDescription.length }}/170</small>
      </label>
    </div>

    <div class="admin-form-grid">
      <label>
        Fecha de publicacion
        <input v-model="publishedAt" class="admin-input" type="datetime-local">
      </label>
      <div class="admin-checks">
        <label><input v-model="state.featured" type="checkbox"> Destacada</label>
        <label><input v-model="state.published" type="checkbox"> Publicada</label>
      </div>
    </div>

    <section>
      <h2>Productos relacionados</h2>
      <AdminProductSelector v-model="state.related_products" :products="products" />
    </section>

    <AdminFormActions
      :submitting="submitting"
      :preview-to="articleId ? `/admin/preview/guias/${articleId}` : undefined"
      @save-draft="save(false)"
      @publish="save(true)"
      @cancel="cancel"
    />
  </form>
</template>

<script setup lang="ts">
import type { Product } from '~~/shared/types/database'
import type { AdminArticle, AdminArticlePayload } from '~~/shared/utils/admin-content'
import { adminArticlePayloadSchema, hasUnsavedChanges, normalizeSlug } from '~~/shared/utils/admin-content'

const props = defineProps<{
  initialValue: AdminArticlePayload
  products: Product[]
  articleId?: string
}>()

const state = reactive<AdminArticlePayload>(structuredClone(props.initialValue))
const savedState = ref<AdminArticlePayload>(structuredClone(props.initialValue))
const slugTouched = ref(Boolean(props.initialValue.slug))
const submitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const coverImageUrl = ref(props.initialValue.cover_image_url ?? '')
const metaTitle = ref(props.initialValue.meta_title ?? '')
const metaDescription = ref(props.initialValue.meta_description ?? '')
const publishedAt = ref(toDatetimeLocal(props.initialValue.published_at))

const hasChanges = computed(() => hasUnsavedChanges(currentPayload(), savedState.value))

function toDatetimeLocal(value: string | null): string {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toISOString().slice(0, 16)
}

function currentPayload(published = state.published): AdminArticlePayload {
  return {
    ...state,
    slug: normalizeSlug(state.slug),
    cover_image_url: coverImageUrl.value.trim() || null,
    meta_title: metaTitle.value.trim() || null,
    meta_description: metaDescription.value.trim() || null,
    published,
    published_at: publishedAt.value ? new Date(publishedAt.value).toISOString() : null,
  }
}

function syncSlugFromTitle() {
  if (!slugTouched.value) {
    state.slug = normalizeSlug(state.title)
  }
}

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as { data?: { statusMessage?: string, message?: string } }).data
    return data?.statusMessage ?? data?.message ?? 'No se ha podido guardar la guia.'
  }

  return 'No se ha podido guardar la guia.'
}

async function save(published: boolean) {
  if (submitting.value) {
    return
  }

  successMessage.value = ''
  errorMessage.value = ''
  const payload = currentPayload(published)
  const validation = adminArticlePayloadSchema.safeParse(payload)

  if (!validation.success) {
    errorMessage.value = validation.error.issues[0]?.message ?? 'Revisa los campos de la guia.'
    return
  }

  submitting.value = true
  try {
    const article = await $fetch<AdminArticle>(
      props.articleId ? `/api/admin/articles/${props.articleId}` : '/api/admin/articles',
      {
        method: props.articleId ? 'PUT' : 'POST',
        body: validation.data,
      },
    )

    savedState.value = validation.data
    Object.assign(state, validation.data)
    successMessage.value = published ? 'Guia guardada y publicada.' : 'Borrador guardado.'

    if (!props.articleId) {
      await navigateTo(`/admin/guias/${article.id}`)
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

  await navigateTo('/admin/guias')
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
