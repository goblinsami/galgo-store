export default defineNuxtConfig({
  compatibilityDate: '2026-07-25',
  modules: ['@nuxtjs/supabase', '@nuxt/eslint'],
  css: ['~/assets/css/main.css'],
  typescript: {
    strict: true,
    typeCheck: true,
  },
  runtimeConfig: {
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    adminEmail: process.env.NUXT_ADMIN_EMAIL || '',
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || '',
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || '',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      amazonAffiliateTag: process.env.NUXT_PUBLIC_AMAZON_AFFILIATE_TAG || '',
    },
  },
  supabase: {
    url: process.env.NUXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co',
    key: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || 'development-anon-key',
    redirect: false,
    useSsrCookies: false,
  },
  nitro: {
    routeRules: {
      '/api/**': { cors: false },
      '/admin/**': { ssr: false },
    },
  },
})
