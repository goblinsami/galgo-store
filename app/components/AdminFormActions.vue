<template>
  <div class="admin-form-actions">
    <button class="button button-secondary" type="button" :disabled="submitting" @click="$emit('saveDraft')">Guardar borrador</button>
    <button class="button" type="button" :disabled="submitting" @click="$emit('publish')">Guardar y publicar</button>
    <NuxtLink v-if="previewTo" class="button button-secondary" :to="previewTo">Previsualizar</NuxtLink>
    <button v-else class="button button-secondary" type="button" disabled>Previsualizar</button>
    <button class="button button-secondary" type="button" :disabled="submitting" @click="$emit('cancel')">Cancelar</button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  submitting: boolean
  previewTo: string | undefined
}>()

defineEmits<{
  saveDraft: []
  publish: []
  cancel: []
}>()
</script>
