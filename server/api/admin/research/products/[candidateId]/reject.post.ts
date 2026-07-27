import { ProductResearchService } from '../../../../../services/product-research/ProductResearchService'
import { requireAdmin } from '../../../../../utils/admin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const candidateId = getRouterParam(event, 'candidateId')
  if (!candidateId) {
    throw createError({ statusCode: 400, statusMessage: 'Candidato no valido.' })
  }

  try {
    return await new ProductResearchService().updateStatus(candidateId, 'rejected')
  } catch (error) {
    throw createError({
      statusCode: 404,
      statusMessage: error instanceof Error ? error.message : 'Candidato no encontrado.',
    })
  }
})
