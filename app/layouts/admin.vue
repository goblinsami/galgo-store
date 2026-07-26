<template>
  <div class="admin-shell">
    <AdminHeader :email="session?.email ?? ''" @sign-out="signOut" />
    <div class="admin-body">
      <AdminNavigation />
      <main class="admin-main">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const client = useSupabaseClient()
const { data: session } = await useFetch<{ email: string }>('/api/admin/session')

async function signOut() {
  await client.auth.signOut()
  await navigateTo('/admin/login')
}

useSeoMeta({
  robots: 'noindex, nofollow',
})
</script>
