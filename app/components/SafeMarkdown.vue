<template>
  <!-- eslint-disable-next-line vue/no-v-html -- Markdown is rendered through renderSafeMarkdown before insertion. -->
  <div class="content" v-html="html" />
</template>

<script setup lang="ts">
import { renderSafeMarkdown } from '~~/shared/utils/markdown'

const props = defineProps<{
  markdown: string
}>()

const html = computed(() => renderSafeMarkdown(props.markdown))
</script>
