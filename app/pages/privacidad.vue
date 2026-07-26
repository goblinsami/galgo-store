<template>
  <section class="section">
    <div class="narrow">
      <p class="eyebrow">Borrador legal pendiente de revision</p>
      <h1 class="page-title">Privacidad</h1>
      <div class="content">
        <p>Este texto es un borrador editable y debe adaptarse legalmente antes de produccion.</p>
        <h2>Eventos tecnicos recogidos</h2>
        <p>La web puede registrar eventos tecnicos minimos necesarios para entender el uso de enlaces afiliados, como pagina de origen, parametros UTM, referrer y fecha del clic.</p>
        <h2>Clics afiliados</h2>
        <p>Cuando una persona pulsa un boton afiliado, se registra un evento en Supabase antes de devolver la URL afiliada del producto. No se debe almacenar direccion IP completa, nombre, email ni datos personales innecesarios.</p>
        <h2>Revision pendiente</h2>
        <p>Antes de publicar, este texto debe revisarse para ajustarlo a la configuracion real de analitica, cookies, proveedores, plazos de conservacion y obligaciones legales aplicables.</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { createCanonicalUrl } from '~~/shared/utils/seo'

const config = useRuntimeConfig()
const { storeName } = useProjectConfig()
const canonical = createCanonicalUrl(String(config.public.siteUrl), '/privacidad')

useSeoMeta({
  title: () => `Privacidad | ${storeName.value}`,
  description: () => `Borrador de privacidad de ${storeName.value} sobre eventos tecnicos y clics afiliados.`,
  ogTitle: 'Privacidad',
  ogDescription: 'Informacion inicial sobre privacidad y clics afiliados.',
  ogUrl: canonical,
})

useHead({
  link: [{ rel: 'canonical', href: canonical }],
})
</script>
