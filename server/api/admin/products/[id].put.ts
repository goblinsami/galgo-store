import { ZodError } from 'zod'
import { parseAdminProductPayload } from '~~/shared/utils/admin-content'
import { mapProduct } from '~~/shared/utils/mappers'
import { requireAdmin } from '../../../utils/admin'
import { readEventJsonBody } from '../../../utils/request-body'

export default defineEventHandler(async (event) => {
  const { supabase } = await requireAdmin(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID no valido.' })
  }

  let payload
  try {
    payload = parseAdminProductPayload(await readEventJsonBody(event))
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error instanceof ZodError ? error.issues[0]?.message ?? 'Payload no valido.' : 'Payload no valido.',
    })
  }

  const duplicate = await supabase
    .from('products')
    .select('id')
    .eq('slug', payload.slug)
    .neq('id', id)
    .maybeSingle()

  if (duplicate.error) {
    throw createError({ statusCode: 500, statusMessage: 'No se ha podido comprobar el slug.' })
  }

  if (duplicate.data) {
    throw createError({ statusCode: 409, statusMessage: 'Ya existe un producto con ese slug.' })
  }

  const { data, error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', id)
    .select('*')
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'No se ha podido guardar el producto.' })
  }

  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'Producto no encontrado.' })
  }

  return mapProduct(data)
})
