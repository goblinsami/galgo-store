export default defineNuxtPlugin(() => {
  const supabase = useSupabaseClient()
  const adminFetch = $fetch.create({
    async onRequest({ request, options }) {
      const requestPath = typeof request === 'string' ? request : request.toString()
      if (!requestPath.startsWith('/api/admin/')) {
        return
      }

      const { data } = await supabase.auth.getSession()
      const accessToken = data.session?.access_token
      if (!accessToken) {
        return
      }

      const headers = new Headers(options.headers)
      headers.set('authorization', `Bearer ${accessToken}`)
      options.headers = headers
    },
  })

  return {
    provide: {
      adminFetch,
    },
  }
})
