<template>
  <section class="admin-login">
    <form class="admin-login-card" @submit.prevent="login">
      <p class="eyebrow">Administracion</p>
      <h1>Entrar en Galgo Store</h1>
      <p v-if="route.query.error === 'forbidden'" class="admin-alert admin-alert-error">
        La cuenta autenticada no tiene acceso al panel.
      </p>
      <p v-if="errorMessage" class="admin-alert admin-alert-error">{{ errorMessage }}</p>
      <label>
        Email
        <input v-model="email" class="admin-input" type="email" autocomplete="email" required>
      </label>
      <label>
        Contrasena
        <input v-model="password" class="admin-input" type="password" autocomplete="current-password" required>
      </label>
      <button class="button" type="submit" :disabled="submitting">Iniciar sesion</button>
      <NuxtLink to="/" class="admin-login-back">Volver a la web</NuxtLink>
    </form>
  </section>
</template>

<script setup lang="ts">
const route = useRoute()
const client = useSupabaseClient()
const email = ref('')
const password = ref('')
const submitting = ref(false)
const errorMessage = ref('')

async function login() {
  if (submitting.value) {
    return
  }

  errorMessage.value = ''
  submitting.value = true

  const { data, error } = await client.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })

  if (error) {
    errorMessage.value = 'No se ha podido iniciar sesion.'
    submitting.value = false
    return
  }

  try {
    if (data.session?.access_token) {
      await $fetch('/api/admin/session', {
        headers: { authorization: `Bearer ${data.session.access_token}` },
      })
    } else {
      await $fetch('/api/admin/session')
    }
    await navigateTo('/admin')
  } catch {
    await client.auth.signOut()
    errorMessage.value = 'Esta cuenta no esta autorizada para administrar la web.'
  } finally {
    submitting.value = false
  }
}

useSeoMeta({
  title: 'Administracion | Galgo Store',
  robots: 'noindex, nofollow',
})
</script>
