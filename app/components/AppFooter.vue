<template>
  <footer class="footer">
    <div class="container footer-grid">
      <div>
        <strong>{{ storeName }}</strong>
        <p>Recomendaciones editoriales para elegir accesorios de galgos con calma, medidas reales y transparencia.</p>
      </div>
      <nav class="nav" aria-label="Enlaces legales">
        <NuxtLink to="/aviso-afiliacion">Aviso de afiliacion</NuxtLink>
        <NuxtLink to="/privacidad">Privacidad</NuxtLink>
      </nav>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { storeName } = useProjectConfig()
</script>
