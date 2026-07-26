<template>
  <span class="admin-status" :class="published ? 'admin-status-published' : 'admin-status-draft'">
    {{ published ? 'Publicado' : 'Borrador' }}
  </span>
</template>

<script setup lang="ts">
defineProps<{
  published: boolean
}>()
</script>
