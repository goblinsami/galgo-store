import { mapProduct } from '~~/shared/utils/mappers'
import { requireAdmin } from '../../../utils/admin'

export default defineEventHandler(async (event) => {
  const { supabase } = await requireAdmin(event)
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'No se han podido cargar los productos.',
    })
  }

  return (data ?? []).map(mapProduct)
})
