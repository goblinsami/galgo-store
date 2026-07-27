import { ZodError } from 'zod'
import type { Database } from '~~/shared/types/database'
import { parseAdminArticlePayload } from '~~/shared/utils/admin-content'
import { mapArticle } from '~~/shared/utils/mappers'
import { requireAdmin } from '../../../utils/admin'
import { readEventJsonBody } from '../../../utils/request-body'

type ArticleProductInsert = Database['public']['Tables']['article_products']['Insert']

export default defineEventHandler(async (event) => {
  const { supabase } = await requireAdmin(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID no valido.' })
  }

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
    .neq('id', id)
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

  const { data, error } = await supabase
    .from('articles')
    .update({
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
    })
    .eq('id', id)
    .select('*')
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'No se ha podido guardar la guia.' })
  }

  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'Guia no encontrada.' })
  }

  const deleteRelations = await supabase
    .from('article_products')
    .delete()
    .eq('article_id', id)

  if (deleteRelations.error) {
    throw createError({ statusCode: 500, statusMessage: 'No se han podido actualizar los productos relacionados.' })
  }

  if (payload.related_products.length) {
    const relations: ArticleProductInsert[] = payload.related_products.map((productId, index) => ({
      article_id: id,
      product_id: productId,
      sort_order: index + 1,
    }))
    const relationResult = await supabase.from('article_products').insert(relations)

    if (relationResult.error) {
      throw createError({ statusCode: 500, statusMessage: 'No se han podido guardar los productos relacionados.' })
    }
  }

  return {
    ...mapArticle(data),
    relatedProducts: payload.related_products,
  }
})
