import { ZodError } from 'zod'
import type { Database } from '~~/shared/types/database'
import { parseAdminArticlePayload } from '~~/shared/utils/admin-content'
import { mapArticle } from '~~/shared/utils/mappers'
import { requireAdmin } from '../../../utils/admin'
import { readEventJsonBody } from '../../../utils/request-body'

type ArticleInsert = Database['public']['Tables']['articles']['Insert']
type ArticleProductInsert = Database['public']['Tables']['article_products']['Insert']

export default defineEventHandler(async (event) => {
  const { supabase } = await requireAdmin(event)

  let payload
  try {
    payload = parseAdminArticlePayload(await readEventJsonBody(event))
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error instanceof ZodError ? error.issues[0]?.message ?? 'Payload no valido.' : 'Payload no valido.',
    })
  }

  const duplicate = await supabase
    .from('articles')
    .select('id')
    .eq('slug', payload.slug)
    .maybeSingle()

  if (duplicate.error) {
    throw createError({ statusCode: 500, statusMessage: 'No se ha podido comprobar el slug.' })
  }

  if (duplicate.data) {
    throw createError({ statusCode: 409, statusMessage: 'Ya existe una guia con ese slug.' })
  }

  if (payload.related_products.length) {
    const existingProducts = await supabase
      .from('products')
      .select('id')
      .in('id', payload.related_products)

    if (existingProducts.error || (existingProducts.data ?? []).length !== payload.related_products.length) {
      throw createError({ statusCode: 400, statusMessage: 'Hay productos relacionados no validos.' })
    }
  }

  const articlePayload: ArticleInsert = {
    title: payload.title,
    slug: payload.slug,
    excerpt: payload.excerpt,
    content: payload.content,
    cover_image_url: payload.cover_image_url,
    meta_title: payload.meta_title,
    meta_description: payload.meta_description,
    featured: payload.featured,
    published: payload.published,
    published_at: payload.published ? payload.published_at ?? new Date().toISOString() : payload.published_at,
  }

  const { data, error } = await supabase
    .from('articles')
    .insert(articlePayload)
    .select('*')
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'No se ha podido crear la guia.' })
  }

  if (payload.related_products.length) {
    const relations: ArticleProductInsert[] = payload.related_products.map((productId, index) => ({
      article_id: data.id,
      product_id: productId,
      sort_order: index + 1,
    }))
    const relationResult = await supabase.from('article_products').insert(relations)

    if (relationResult.error) {
      await supabase.from('articles').delete().eq('id', data.id)
      throw createError({ statusCode: 500, statusMessage: 'No se han podido guardar los productos relacionados.' })
    }
  }

  return {
    ...mapArticle(data),
    relatedProducts: payload.related_products,
  }
})
