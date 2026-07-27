import { ProductResearchService } from '../../../../../services/product-research/ProductResearchService'
import { requireAdmin } from '../../../../../utils/admin'

export default defineEventHandler(async (event) => {
  const { supabase } = await requireAdmin(event)
  const candidateId = getRouterParam(event, 'candidateId')
  if (!candidateId) {
    throw createError({ statusCode: 400, statusMessage: 'Candidato no valido.' })
  }

  try {
    return await new ProductResearchService().importCandidateAsDraft(candidateId, supabase)
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error instanceof Error ? error.message : 'No se ha podido importar el candidato.',
    })
  }
})
