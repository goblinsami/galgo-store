import { createCanonicalUrl } from '~~/shared/utils/seo'
import { createServerSupabaseClient } from '../utils/supabase'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const siteUrl = String(config.public.siteUrl)
  const urls = [
    '/',
    '/productos',
    '/guias',
    '/aviso-afiliacion',
    '/privacidad',
  ]

  const supabase = createServerSupabaseClient()
  if (supabase) {
    const [products, articles] = await Promise.all([
      supabase.from('products').select('slug').eq('published', true),
      supabase.from('articles').select('slug').eq('published', true),
    ])

    for (const product of products.data ?? []) {
      urls.push(`/productos/${product.slug}`)
    }

    for (const article of articles.data ?? []) {
      urls.push(`/guias/${article.slug}`)
    }
  }

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((path) => `  <url><loc>${createCanonicalUrl(siteUrl, path)}</loc></url>`)
    .join('\n')}\n</urlset>`
})
