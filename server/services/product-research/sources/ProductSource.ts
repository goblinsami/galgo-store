import type { SourceProduct } from '../../../../shared/types/product-research'

export interface ProductSource {
  id: string

  searchProducts(input: {
    keywords: string
    marketplace: string
    limit: number
  }): Promise<SourceProduct[]>

  getProduct(input: {
    externalId: string
    marketplace: string
  }): Promise<SourceProduct | null>
}
