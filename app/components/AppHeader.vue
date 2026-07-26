<template>
  <header class="site-header">
    <div class="container header-inner">
      <NuxtLink class="brand" to="/">
        <span class="brand-mark" aria-hidden="true">{{ storeInitial }}</span>
        <span>{{ storeName }}</span>
      </NuxtLink>
      <nav class="nav" aria-label="Navegacion principal">
        <NuxtLink to="/productos">Productos</NuxtLink>
        <NuxtLink to="/guias">Guias</NuxtLink>
        <NuxtLink to="/aviso-afiliacion">Afiliacion</NuxtLink>
        <NuxtLink to="/privacidad">Privacidad</NuxtLink>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
const { storeName, storeInitial } = useProjectConfig()
</script>
