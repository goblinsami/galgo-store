export function useSupabaseStatus() {
  const config = useRuntimeConfig()
  const hasSupabaseConfig = computed(() => {
    return Boolean(config.public.supabaseUrl && config.public.supabaseAnonKey)
  })

  return {
    hasSupabaseConfig,
  }
}
