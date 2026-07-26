<template>
  <div v-if="open" class="admin-dialog-backdrop" role="presentation">
    <section class="admin-dialog" role="dialog" aria-modal="true" :aria-labelledby="titleId">
      <h2 :id="titleId">{{ title }}</h2>
      <p>{{ message }}</p>
      <div class="admin-actions">
        <button class="button button-secondary" type="button" @click="$emit('cancel')">Cancelar</button>
        <button class="button admin-danger" type="button" @click="$emit('confirm')">Eliminar</button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  open: boolean
  title: string
  message: string
}>()

defineEmits<{
  cancel: []
  confirm: []
}>()

const titleId = `dialog-${Math.random().toString(36).slice(2)}`
</script>
