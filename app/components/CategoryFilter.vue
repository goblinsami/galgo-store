<template>
  <form class="filter-bar" @submit.prevent>
    <label for="category-filter"><strong>Filtrar por categoria</strong></label>
    <select id="category-filter" v-model="selected" class="select" @change="changeCategory">
      <option value="">Todas</option>
      <option v-for="category in PRODUCT_CATEGORIES" :key="category" :value="category">
        {{ PRODUCT_CATEGORY_LABELS[category] }}
      </option>
    </select>
  </form>
</template>

<script setup lang="ts">
import type { ProductCategory } from '~~/shared/types/database'
import { PRODUCT_CATEGORIES, PRODUCT_CATEGORY_LABELS } from '~~/shared/utils/categories'

const props = defineProps<{
  currentCategory?: ProductCategory | undefined
}>()

const selected = ref<ProductCategory | ''>(props.currentCategory ?? '')
const router = useRouter()

watch(() => props.currentCategory, (value) => {
  selected.value = value ?? ''
})

async function changeCategory() {
  await router.push({
    path: '/productos',
    query: selected.value ? { categoria: selected.value } : {},
  })
}
</script>
