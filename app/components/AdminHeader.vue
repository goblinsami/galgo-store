<template>
  <header class="admin-header">
    <NuxtLink to="/admin" class="admin-brand">Galgo Store</NuxtLink>
    <div class="admin-header-actions">
      <span class="admin-email">{{ email }}</span>
      <button class="button button-secondary" type="button" @click="$emit('signOut')">Cerrar sesion</button>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  email: string
}>()

defineEmits<{
  signOut: []
}>()
</script>
