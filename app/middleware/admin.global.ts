export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/admin')) {
    return
  }

  const isLogin = to.path === '/admin/login'
  const client = useSupabaseClient()
  const { data } = await client.auth.getSession()
  const accessToken = data.session?.access_token

  if (!accessToken) {
    if (!isLogin) {
      return navigateTo('/admin/login')
    }

    return
  }

  try {
    if (import.meta.server) {
      await $fetch('/api/admin/session', { headers: useRequestHeaders(['cookie']) })
    } else {
      await $fetch('/api/admin/session', { headers: { authorization: `Bearer ${accessToken}` } })
    }
  } catch {
    if (!isLogin) {
      return navigateTo('/admin/login?error=forbidden')
    }

    return
  }

  if (isLogin) {
    return navigateTo('/admin')
  }
})
