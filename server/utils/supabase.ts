import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~~/shared/types/database'

export function createServerSupabaseClient(): SupabaseClient<Database> | null {
  const config = useRuntimeConfig()
  const url = process.env.NUXT_PUBLIC_SUPABASE_URL || String(config.public.supabaseUrl || '')
  const anonKey = process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || String(config.public.supabaseAnonKey || '')

  if (!url || !anonKey) {
    return null
  }

  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

export function createServerSupabaseServiceClient(): SupabaseClient<Database> | null {
  const config = useRuntimeConfig()
  const url = process.env.NUXT_PUBLIC_SUPABASE_URL || String(config.public.supabaseUrl || '')
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || String(config.supabaseServiceRoleKey || '')

  if (!url || !serviceRoleKey) {
    return null
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}
