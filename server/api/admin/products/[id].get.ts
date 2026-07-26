import { mapProduct } from '~~/shared/utils/mappers'
import { requireAdmin } from '../../../utils/admin'

export default defineEventHandler(async (event) => {
  const { supabase } = await requireAdmin(event)
  const id = getRouterParam(event, 'id')

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id ?? '')
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'No se ha podido cargar el producto.' })
  }

  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'Producto no encontrado.' })
  }

  return mapProduct(data)
})
