import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~~/shared/types/database'

let cachedClient: SupabaseClient<Database> | null = null

export function useSupabaseClient<T = Database>(): SupabaseClient<T> {
  if (!cachedClient) {
    const config = useRuntimeConfig()
    const url = String(config.public.supabaseUrl || 'https://example.supabase.co')
    const anonKey = String(config.public.supabaseAnonKey || 'development-anon-key')

    cachedClient = createClient<Database>(url, anonKey, {
      auth: {
        persistSession: import.meta.client,
        autoRefreshToken: import.meta.client,
        detectSessionInUrl: false,
      },
    })
  }

  return cachedClient as unknown as SupabaseClient<T>
}
