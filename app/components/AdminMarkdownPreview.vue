<template>
  <section class="admin-preview-pane">
    <h2>Previsualizacion</h2>
    <SafeMarkdown :markdown="markdown" />
  </section>
</template>

<script setup lang="ts">
defineProps<{
  markdown: string
}>()
</script>
