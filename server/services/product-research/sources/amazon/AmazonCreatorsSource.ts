import type { SourceProduct } from '../../../../../shared/types/product-research'
import type { ProductSource } from '../ProductSource'
import { getAmazonCreatorsConfig } from './amazonCreators.schemas'
import { mapAmazonProductToCandidate } from './amazonCreators.mapper'
import type { AmazonCreatorsClient } from './AmazonCreatorsClient'
import { AmazonCreatorsClient as DefaultAmazonCreatorsClient } from './AmazonCreatorsClient'

export class AmazonCreatorsSource implements ProductSource {
  id = 'amazon'

  private readonly client: AmazonCreatorsClient
  private readonly config = getAmazonCreatorsConfig()

  constructor(client?: AmazonCreatorsClient) {
    this.client = client ?? new DefaultAmazonCreatorsClient(this.config)
  }

  async searchProducts(input: {
    keywords: string
    marketplace: string
    limit: number
  }): Promise<SourceProduct[]> {
    this.assertMarketplace(input.marketplace)
    const retrievedAt = new Date().toISOString()
    const response = await this.client.searchItems({
      keywords: input.keywords,
      limit: Math.min(input.limit, this.config.maxResults),
    })
    const items = response.searchResult?.items ?? response.itemsResult?.items ?? []

    return items.flatMap((item) => {
      try {
        return [mapAmazonProductToCandidate(item, {
          query: input.keywords,
          marketplace: this.config.marketplace,
          associateTag: this.config.associateTag,
          retrievedAt,
          fixture: this.config.mode === 'fixture',
        })]
      } catch {
        return []
      }
    })
  }

  async getProduct(input: {
    externalId: string
    marketplace: string
  }): Promise<SourceProduct | null> {
    this.assertMarketplace(input.marketplace)
    const retrievedAt = new Date().toISOString()
    const response = await this.client.getItems({ itemIds: [input.externalId] })
    const item = (response.itemResults?.items ?? response.itemsResult?.items ?? [])
      .find((candidate) => candidate.asin === input.externalId)

    if (!item) {
      return null
    }

    return mapAmazonProductToCandidate(item, {
      query: input.externalId,
      marketplace: this.config.marketplace,
      associateTag: this.config.associateTag,
      retrievedAt,
      fixture: this.config.mode === 'fixture',
    })
  }

  private assertMarketplace(marketplace: string): void {
    if (marketplace !== this.config.marketplace && marketplace !== this.config.apiMarketplace) {
      throw new Error('AmazonCreatorsSource solo permite Amazon Espana.')
    }
  }
}
