<template>
  <div class="placeholder" role="img" :aria-label="label">
    <span>{{ displayText }}</span>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  label?: string
  text?: string
}>(), {
  label: 'Imagen pendiente',
  text: '',
})

const { storeName } = useProjectConfig()
const displayText = computed(() => props.text || storeName.value)
</script>
