<template>
  <section class="section">
    <div class="narrow">
      <p class="eyebrow">Borrador legal pendiente de revision</p>
      <h1 class="page-title">Aviso de afiliacion</h1>
      <div class="content">
        <p>Este texto es un borrador inicial y debe revisarse antes de publicar la web en produccion.</p>
        <p>Algunos enlaces de {{ storeName }} pueden ser enlaces de afiliado. Si compras desde esos enlaces, la web puede recibir una comision.</p>
        <p>Usar un enlace de afiliado no deberia aumentar el precio para el comprador. Aun asi, las condiciones concretas pueden depender del programa de afiliacion vigente y deben verificarse antes de produccion.</p>
        <p>La existencia de un enlace no implica que {{ storeName }} haya probado el producto, ni que exista una relacion contractual adicional con el vendedor. Las recomendaciones son editoriales y deben contrastarse con las medidas y necesidades de cada perro.</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { createCanonicalUrl } from '~~/shared/utils/seo'

const config = useRuntimeConfig()
const { storeName } = useProjectConfig()
const canonical = createCanonicalUrl(String(config.public.siteUrl), '/aviso-afiliacion')

useSeoMeta({
  title: () => `Aviso de afiliacion | ${storeName.value}`,
  description: () => `Borrador del aviso de afiliacion de ${storeName.value} y explicacion de enlaces afiliados.`,
  ogTitle: 'Aviso de afiliacion',
  ogDescription: () => `Transparencia sobre enlaces afiliados en ${storeName.value}.`,
  ogUrl: canonical,
})

useHead({
  link: [{ rel: 'canonical', href: canonical }],
})
</script>
