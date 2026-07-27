export default defineNuxtConfig({
  compatibilityDate: '2026-07-25',
  modules: ['@nuxt/eslint'],
  css: ['~/assets/css/main.css'],
  typescript: {
    strict: true,
    typeCheck: true,
  },
  runtimeConfig: {
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    adminEmail: process.env.NUXT_ADMIN_EMAIL || '',
    amazonCreatorsEnabled: process.env.AMAZON_CREATORS_ENABLED || 'false',
    amazonCreatorsMode: process.env.AMAZON_CREATORS_MODE || 'fixture',
    amazonCreatorsMarketplace: process.env.AMAZON_CREATORS_MARKETPLACE || 'amazon.es',
    amazonAssociateTag: process.env.AMAZON_ASSOCIATE_TAG || '',
    amazonCreatorsCredentialId: process.env.AMAZON_CREATORS_CREDENTIAL_ID || '',
    amazonCreatorsCredentialSecret: process.env.AMAZON_CREATORS_CREDENTIAL_SECRET || '',
    amazonCreatorsCredentialVersion: process.env.AMAZON_CREATORS_CREDENTIAL_VERSION || '3.2',
    amazonCreatorsMaxResults: process.env.AMAZON_CREATORS_MAX_RESULTS || '10',
    amazonCreatorsTimeoutMs: process.env.AMAZON_CREATORS_TIMEOUT_MS || '12000',
    amazonCreatorsRetries: process.env.AMAZON_CREATORS_RETRIES || '2',
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || '',
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || '',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      amazonAffiliateTag: process.env.NUXT_PUBLIC_AMAZON_AFFILIATE_TAG || '',
    },
  },
  nitro: {
    routeRules: {
      '/api/**': { cors: false },
      '/admin/**': { ssr: false },
    },
  },
})
