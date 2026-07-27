import { ZodError, z } from 'zod'
import { ProductResearchService } from '../../../../services/product-research/ProductResearchService'
import { requireAdmin } from '../../../../utils/admin'
import { readEventJsonBody } from '../../../../utils/request-body'
import { PRODUCT_CATEGORIES } from '../../../../../shared/utils/categories'

const bodySchema = z.object({
  query: z.string().trim().min(2).max(120).optional(),
  category: z.enum(PRODUCT_CATEGORIES).optional(),
  limit: z.coerce.number().int().min(1).max(10).optional(),
}).refine((value) => value.query || value.category, 'Indica una busqueda o categoria.')

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  let input
  try {
    input = bodySchema.parse(await readEventJsonBody(event))
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error instanceof ZodError ? error.issues[0]?.message ?? 'Payload no valido.' : 'Payload no valido.',
    })
  }

  try {
    return await new ProductResearchService().run(input)
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'No se ha podido ejecutar la investigacion.',
    })
  }
})
