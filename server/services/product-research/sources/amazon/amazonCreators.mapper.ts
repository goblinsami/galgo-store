import type { ProductEvidence, SourceProduct, SourceProductImage } from '../../../../../shared/types/product-research'
import { isAllowedAmazonSpainUrl } from '../../../../../shared/utils/affiliate'
import { amazonAsinSchema } from './amazonCreators.schemas'
import type { AmazonCreatorsItem, AmazonCreatorsRequestContext } from './amazonCreators.types'

function text(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function bestImage(images: AmazonCreatorsItem['images']): string | null {
  const candidates = [
    images?.primary?.hiRes?.url,
    images?.primary?.large?.url,
    images?.primary?.medium?.url,
    images?.primary?.small?.url,
  ]

  return candidates.find((url) => text(url)) ?? null
}

function collectImages(item: AmazonCreatorsItem, retrievedAt: string): SourceProductImage[] {
  const urls = new Set<string>()
  const add = (value: string | null | undefined) => {
    const clean = text(value)
    if (clean) {
      urls.add(clean)
    }
  }

  add(item.images?.primary?.hiRes?.url)
  add(item.images?.primary?.large?.url)
  add(item.images?.primary?.medium?.url)
  add(item.images?.primary?.small?.url)

  for (const variant of item.images?.variants ?? []) {
    add(variant.hiRes?.url)
    add(variant.large?.url)
    add(variant.medium?.url)
    add(variant.small?.url)
  }

  return [...urls].map((url) => ({
    url,
    source: 'amazon-creators-api',
    retrievedAt,
  }))
}

function firstListing(item: AmazonCreatorsItem) {
  return item.offersV2?.listings?.[0] ?? null
}

function evidence(field: string, value: string | null | undefined): ProductEvidence | null {
  const clean = text(value)
  if (!clean) {
    return null
  }

  return {
    field,
    value: clean,
    source: 'amazon-creators-api',
  }
}

function parseReviewCount(value: number | null | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null
}

function parseRating(value: number | null | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 5 ? value : null
}

function validateAffiliateUrl(url: string, asin: string, associateTag: string): void {
  if (!isAllowedAmazonSpainUrl(url)) {
    throw new Error('La URL afiliada de Amazon no pertenece a Amazon Espana.')
  }

  const parsed = new URL(url)
  if (!parsed.pathname.includes(asin)) {
    throw new Error('La URL afiliada no contiene el ASIN esperado.')
  }

  if (associateTag && parsed.searchParams.get('tag') !== associateTag) {
    throw new Error('La URL afiliada no contiene el tracking ID configurado.')
  }
}

export function mapAmazonProductToCandidate(
  amazonProduct: AmazonCreatorsItem,
  context: AmazonCreatorsRequestContext,
): SourceProduct {
  const asin = amazonAsinSchema.parse(text(amazonProduct.asin) ?? '')
  const title = text(amazonProduct.itemInfo?.title?.displayValue)

  if (!title) {
    throw new Error(`El producto ${asin} no incluye titulo.`)
  }

  const affiliateUrl = text(amazonProduct.detailPageURL)
  if (!affiliateUrl) {
    throw new Error(`El producto ${asin} no incluye URL afiliada.`)
  }

  validateAffiliateUrl(affiliateUrl, asin, context.associateTag)

  const listing = firstListing(amazonProduct)
  const priceAmount = listing?.price?.money?.amount
  const priceCurrency = text(listing?.price?.money?.currency)
  const brand = text(amazonProduct.itemInfo?.byLineInfo?.brand?.displayValue)
    ?? text(amazonProduct.itemInfo?.byLineInfo?.manufacturer?.displayValue)
  const features = (amazonProduct.itemInfo?.features?.displayValues ?? [])
    .map((item) => item.trim())
    .filter(Boolean)
  const amazonCategory = text(amazonProduct.itemInfo?.classifications?.productGroup?.displayValue)
    ?? text(amazonProduct.itemInfo?.classifications?.binding?.displayValue)
  const images = collectImages(amazonProduct, context.retrievedAt)
  const primaryImage = bestImage(amazonProduct.images)

  const evidenceItems = [
    evidence('title', title),
    evidence('brand', brand),
    evidence('amazonCategory', amazonCategory),
    ...features.map((feature, index) => evidence(`feature.${index + 1}`, feature)),
  ].filter((item): item is ProductEvidence => Boolean(item))

  return {
    source: 'amazon',
    sourceApi: 'amazon-creators-api',
    marketplace: context.marketplace,
    externalId: asin,
    asin,
    parentAsin: text(amazonProduct.parentASIN),
    title,
    brand,
    sourceUrl: affiliateUrl,
    affiliateUrl,
    imageUrl: primaryImage,
    images,
    price: {
      amount: typeof priceAmount === 'number' && Number.isFinite(priceAmount) ? priceAmount : null,
      currency: priceCurrency,
      retrievedAt: context.retrievedAt,
    },
    availability: text(listing?.availability?.message) ?? text(listing?.availability?.type),
    features,
    variants: (amazonProduct.variationAttributes ?? [])
      .map((variant) => [variant.name, variant.value].map((value) => text(value)).filter(Boolean).join(': '))
      .filter(Boolean),
    customerRating: parseRating(amazonProduct.customerReviews?.starRating?.value),
    reviewCount: parseReviewCount(amazonProduct.customerReviews?.count),
    amazonCategory,
    retrievedAt: context.retrievedAt,
    rawFacts: [title, brand, amazonCategory, ...features].filter((item): item is string => Boolean(item)),
    evidence: evidenceItems,
  }
}

export function validateAmazonCandidateForImport(candidate: Pick<SourceProduct, 'sourceApi' | 'asin' | 'marketplace' | 'affiliateUrl'>, associateTag: string): void {
  if (candidate.sourceApi !== 'amazon-creators-api') {
    throw new Error('El candidato no procede de Amazon Creators API.')
  }

  amazonAsinSchema.parse(candidate.asin)

  if (candidate.marketplace !== 'amazon.es') {
    throw new Error('El candidato no pertenece a Amazon Espana.')
  }

  validateAffiliateUrl(candidate.affiliateUrl, candidate.asin, associateTag)
}
