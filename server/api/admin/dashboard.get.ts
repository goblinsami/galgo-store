import type { AdminDashboard } from '~~/shared/utils/admin-content'
import { requireAdmin } from '../../utils/admin'

export default defineEventHandler(async (event): Promise<AdminDashboard> => {
  const { supabase } = await requireAdmin(event)

  const [products, publishedProducts, articles, publishedArticles] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('published', true),
    supabase.from('articles').select('id', { count: 'exact', head: true }),
    supabase.from('articles').select('id', { count: 'exact', head: true }).eq('published', true),
  ])

  if (products.error || publishedProducts.error || articles.error || publishedArticles.error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'No se han podido cargar las metricas.',
    })
  }

  const productTotal = products.count ?? 0
  const articleTotal = articles.count ?? 0
  const productPublished = publishedProducts.count ?? 0
  const articlePublished = publishedArticles.count ?? 0

  return {
    products: {
      total: productTotal,
      published: productPublished,
      draft: productTotal - productPublished,
    },
    articles: {
      total: articleTotal,
      published: articlePublished,
      draft: articleTotal - articlePublished,
    },
  }
})
