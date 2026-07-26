<template>
  <div class="admin-selector">
    <label v-for="product in products" :key="product.id" class="admin-checkbox-row">
      <input
        type="checkbox"
        :checked="selected.includes(product.id)"
        @change="toggle(product.id)"
      >
      <span>{{ product.name }}</span>
      <small>{{ PRODUCT_CATEGORY_LABELS[product.category] }}</small>
    </label>
    <div v-if="selectedProducts.length" class="admin-selected-order">
      <p>Orden relacionado</p>
      <ol>
        <li v-for="product in selectedProducts" :key="product.id">
          {{ product.name }}
          <button type="button" class="admin-mini-button" @click="move(product.id, -1)">Subir</button>
          <button type="button" class="admin-mini-button" @click="move(product.id, 1)">Bajar</button>
        </li>
      </ol>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~~/shared/types/database'
import { PRODUCT_CATEGORY_LABELS } from '~~/shared/utils/categories'

const props = defineProps<{
  products: Product[]
  modelValue: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const selected = computed(() => props.modelValue)
const selectedProducts = computed(() => selected.value
  .map((id) => props.products.find((product) => product.id === id))
  .filter((product): product is Product => Boolean(product)))

function toggle(productId: string) {
  if (selected.value.includes(productId)) {
    emit('update:modelValue', selected.value.filter((id) => id !== productId))
    return
  }

  emit('update:modelValue', [...selected.value, productId])
}

function move(productId: string, direction: -1 | 1) {
  const next = [...selected.value]
  const currentIndex = next.indexOf(productId)
  const targetIndex = currentIndex + direction

  if (currentIndex < 0 || targetIndex < 0 || targetIndex >= next.length) {
    return
  }

  const [item] = next.splice(currentIndex, 1)
  if (!item) {
    return
  }

  next.splice(targetIndex, 0, item)
  emit('update:modelValue', next)
}
</script>
