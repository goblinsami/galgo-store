import type { ProductCategory } from './database'

export type ProductResearchSourceId = 'amazon'
export type ProductResearchMarketplace = 'amazon.es'
export type ProductResearchMode = 'live' | 'fixture'
export type ProductCandidateStatus = 'candidate' | 'approved' | 'rejected' | 'imported'
export type SuitabilityStatus = 'promising' | 'manual_review_required'

export interface ProductEvidence {
  field: string
  value: string
  source: 'amazon-creators-api'
}

export interface SourceProductImage {
  url: string
  source: 'amazon-creators-api'
  retrievedAt: string
}

export interface SourceProductPrice {
  amount: number | null
  currency: string | null
  retrievedAt: string
}

export interface SourceProduct {
  source: ProductResearchSourceId
  sourceApi: 'amazon-creators-api'
  marketplace: ProductResearchMarketplace
  externalId: string
  asin: string
  parentAsin: string | null
  title: string
  brand: string | null
  sourceUrl: string
  affiliateUrl: string
  imageUrl: string | null
  images: SourceProductImage[]
  price: SourceProductPrice
  availability: string | null
  features: string[]
  variants: string[]
  customerRating: number | null
  reviewCount: number | null
  amazonCategory: string | null
  retrievedAt: string
  rawFacts: string[]
  evidence: ProductEvidence[]
}

export interface ProductCandidate extends SourceProduct {
  id: string
  query: string
  category: ProductCategory
  suitabilityScore: number
  suitabilityReasons: string[]
  suitabilityWarnings: string[]
  suitabilityEvidence: ProductEvidence[]
  suitabilityStatus: SuitabilityStatus
  totalScore: number
  status: ProductCandidateStatus
  fixture: boolean
}

export interface ProductResearchRun {
  runId: string
  createdAt: string
  source: ProductResearchSourceId
  marketplace: ProductResearchMarketplace
  mode: ProductResearchMode
  queries: Array<{
    query: string
    category: ProductCategory
  }>
  candidates: ProductCandidate[]
  errors: Array<{
    query?: string
    externalId?: string
    code: string
    message: string
  }>
}
