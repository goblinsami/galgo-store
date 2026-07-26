<template>
  <section>
    <div class="admin-page-heading">
      <div>
        <p class="eyebrow">Productos</p>
        <h1>Nuevo producto</h1>
      </div>
    </div>
    <AdminProductForm :initial-value="initialValue" />
  </section>
</template>

<script setup lang="ts">
import { emptyAdminProductPayload } from '~~/shared/utils/admin-content'

definePageMeta({
  layout: 'admin',
})

const initialValue = emptyAdminProductPayload()
</script>
