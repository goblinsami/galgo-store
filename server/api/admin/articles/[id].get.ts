import { mapArticle } from '~~/shared/utils/mappers'
import { requireAdmin } from '../../../utils/admin'

export default defineEventHandler(async (event) => {
  const { supabase } = await requireAdmin(event)
  const id = getRouterParam(event, 'id')

  const [articleResult, relationsResult] = await Promise.all([
    supabase
      .from('articles')
      .select('*')
      .eq('id', id ?? '')
      .maybeSingle(),
    supabase
      .from('article_products')
      .select('product_id, sort_order')
      .eq('article_id', id ?? '')
      .order('sort_order', { ascending: true }),
  ])

  if (articleResult.error || relationsResult.error) {
    throw createError({ statusCode: 500, statusMessage: 'No se ha podido cargar la guia.' })
  }

  if (!articleResult.data) {
    throw createError({ statusCode: 404, statusMessage: 'Guia no encontrada.' })
  }

  return {
    ...mapArticle(articleResult.data),
    relatedProducts: (relationsResult.data ?? []).map((relation) => relation.product_id),
  }
})
