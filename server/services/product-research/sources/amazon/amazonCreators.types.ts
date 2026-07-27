import type { ProductResearchMode } from '../../../../../shared/types/product-research'

export type AmazonCreatorsCredentialVersion = '2.1' | '2.2' | '2.3' | '3.1' | '3.2' | '3.3'

export interface AmazonCreatorsConfig {
  enabled: boolean
  mode: ProductResearchMode
  marketplace: 'amazon.es'
  apiMarketplace: 'www.amazon.es'
  associateTag: string
  credentialId: string
  credentialSecret: string
  credentialVersion: AmazonCreatorsCredentialVersion
  maxResults: number
  timeoutMs: number
  retries: number
}

export interface AmazonCreatorsRequestContext {
  query: string
  marketplace: 'amazon.es'
  associateTag: string
  retrievedAt: string
  fixture: boolean
}

export interface AmazonCreatorsItem {
  asin?: string | null
  parentASIN?: string | null
  detailPageURL?: string | null
  images?: {
    primary?: AmazonCreatorsImageSet | null
    variants?: AmazonCreatorsImageSet[] | null
  } | null
  itemInfo?: {
    title?: AmazonCreatorsDisplayValue | null
    byLineInfo?: {
      brand?: AmazonCreatorsDisplayValue | null
      manufacturer?: AmazonCreatorsDisplayValue | null
    } | null
    features?: {
      displayValues?: string[] | null
    } | null
    classifications?: {
      productGroup?: AmazonCreatorsDisplayValue | null
      binding?: AmazonCreatorsDisplayValue | null
    } | null
    productInfo?: Record<string, unknown> | null
    technicalInfo?: Record<string, unknown> | null
  } | null
  offersV2?: {
    listings?: AmazonCreatorsListing[] | null
  } | null
  customerReviews?: {
    count?: number | null
    starRating?: {
      value?: number | null
    } | null
  } | null
  variationAttributes?: Array<{
    name?: string | null
    value?: string | null
  }> | null
}

export interface AmazonCreatorsDisplayValue {
  displayValue?: string | null
}

export interface AmazonCreatorsImageSet {
  small?: AmazonCreatorsImage | null
  medium?: AmazonCreatorsImage | null
  large?: AmazonCreatorsImage | null
  hiRes?: AmazonCreatorsImage | null
}

export interface AmazonCreatorsImage {
  url?: string | null
  width?: number | null
  height?: number | null
}

export interface AmazonCreatorsListing {
  availability?: {
    message?: string | null
    type?: string | null
  } | null
  price?: {
    money?: {
      amount?: number | null
      currency?: string | null
    } | null
    displayAmount?: string | null
  } | null
}

export interface AmazonCreatorsSearchResponse {
  searchResult?: {
    items?: AmazonCreatorsItem[] | null
  } | null
  itemsResult?: {
    items?: AmazonCreatorsItem[] | null
  } | null
  errors?: Array<{
    code?: string
    message?: string
  }> | null
}

export interface AmazonCreatorsGetItemsResponse {
  itemResults?: {
    items?: AmazonCreatorsItem[] | null
  } | null
  itemsResult?: {
    items?: AmazonCreatorsItem[] | null
  } | null
  errors?: Array<{
    code?: string
    message?: string
  }> | null
}
