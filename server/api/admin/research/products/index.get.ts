import { ProductResearchService } from '../../../../services/product-research/ProductResearchService'
import { requireAdmin } from '../../../../utils/admin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return await new ProductResearchService().latest()
})
