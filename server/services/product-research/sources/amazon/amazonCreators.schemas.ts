import { z } from 'zod'
import type { AmazonCreatorsConfig, AmazonCreatorsGetItemsResponse, AmazonCreatorsSearchResponse } from './amazonCreators.types'

export const AMAZON_CREATORS_API_BASE_URL = 'https://creatorsapi.amazon'
export const AMAZON_CREATORS_MARKETPLACE = 'amazon.es'
export const AMAZON_CREATORS_API_MARKETPLACE = 'www.amazon.es'
export const AMAZON_CREATORS_MAX_RESULTS = 10
export const AMAZON_CREATORS_RESOURCES = [
  'images.primary.large',
  'images.primary.medium',
  'images.variants.large',
  'itemInfo.title',
  'itemInfo.byLineInfo',
  'itemInfo.features',
  'itemInfo.classifications',
  'itemInfo.productInfo',
  'itemInfo.technicalInfo',
  'offersV2.listings.availability',
  'offersV2.listings.price',
  'customerReviews.count',
  'customerReviews.starRating',
  'parentASIN',
] as const

export const amazonCreatorsModeSchema = z.enum(['live', 'fixture'])
export const amazonCreatorsCredentialVersionSchema = z.enum(['2.1', '2.2', '2.3', '3.1', '3.2', '3.3'])
export const amazonAsinSchema = z.string().trim().regex(/^[A-Z0-9]{10}$/)

const looseImageSchema = z.object({
  url: z.string().url().optional().nullable(),
  width: z.number().optional().nullable(),
  height: z.number().optional().nullable(),
}).passthrough()

const displayValueSchema = z.object({
  displayValue: z.string().optional().nullable(),
}).passthrough()

const itemSchema = z.object({
  asin: z.string().optional().nullable(),
  parentASIN: z.string().optional().nullable(),
  detailPageURL: z.string().optional().nullable(),
  images: z.object({
    primary: z.object({
      small: looseImageSchema.optional().nullable(),
      medium: looseImageSchema.optional().nullable(),
      large: looseImageSchema.optional().nullable(),
      hiRes: looseImageSchema.optional().nullable(),
    }).passthrough().optional().nullable(),
    variants: z.array(z.object({
      small: looseImageSchema.optional().nullable(),
      medium: looseImageSchema.optional().nullable(),
      large: looseImageSchema.optional().nullable(),
      hiRes: looseImageSchema.optional().nullable(),
    }).passthrough()).optional().nullable(),
  }).passthrough().optional().nullable(),
  itemInfo: z.object({
    title: displayValueSchema.optional().nullable(),
    byLineInfo: z.object({
      brand: displayValueSchema.optional().nullable(),
      manufacturer: displayValueSchema.optional().nullable(),
    }).passthrough().optional().nullable(),
    features: z.object({
      displayValues: z.array(z.string()).optional().nullable(),
    }).passthrough().optional().nullable(),
    classifications: z.object({
      productGroup: displayValueSchema.optional().nullable(),
      binding: displayValueSchema.optional().nullable(),
    }).passthrough().optional().nullable(),
    productInfo: z.record(z.string(), z.unknown()).optional().nullable(),
    technicalInfo: z.record(z.string(), z.unknown()).optional().nullable(),
  }).passthrough().optional().nullable(),
  offersV2: z.object({
    listings: z.array(z.object({
      availability: z.object({
        message: z.string().optional().nullable(),
        type: z.string().optional().nullable(),
      }).passthrough().optional().nullable(),
      price: z.object({
        money: z.object({
          amount: z.number().optional().nullable(),
          currency: z.string().optional().nullable(),
        }).passthrough().optional().nullable(),
        displayAmount: z.string().optional().nullable(),
      }).passthrough().optional().nullable(),
    }).passthrough()).optional().nullable(),
  }).passthrough().optional().nullable(),
  customerReviews: z.object({
    count: z.number().optional().nullable(),
    starRating: z.object({
      value: z.number().optional().nullable(),
    }).passthrough().optional().nullable(),
  }).passthrough().optional().nullable(),
  variationAttributes: z.array(z.object({
    name: z.string().optional().nullable(),
    value: z.string().optional().nullable(),
  }).passthrough()).optional().nullable(),
}).passthrough()

const errorSchema = z.object({
  code: z.string().optional(),
  message: z.string().optional(),
}).passthrough()

export const amazonCreatorsSearchResponseSchema = z.object({
  searchResult: z.object({
    items: z.array(itemSchema).optional().nullable(),
  }).passthrough().optional().nullable(),
  itemsResult: z.object({
    items: z.array(itemSchema).optional().nullable(),
  }).passthrough().optional().nullable(),
  errors: z.array(errorSchema).optional().nullable(),
}).passthrough()

export const amazonCreatorsGetItemsResponseSchema = z.object({
  itemResults: z.object({
    items: z.array(itemSchema).optional().nullable(),
  }).passthrough().optional().nullable(),
  itemsResult: z.object({
    items: z.array(itemSchema).optional().nullable(),
  }).passthrough().optional().nullable(),
  errors: z.array(errorSchema).optional().nullable(),
}).passthrough()

export function getAmazonCreatorsConfig(env: NodeJS.ProcessEnv = process.env): AmazonCreatorsConfig {
  const mode = amazonCreatorsModeSchema.parse(env.AMAZON_CREATORS_MODE || 'fixture')
  const marketplace = env.AMAZON_CREATORS_MARKETPLACE || AMAZON_CREATORS_MARKETPLACE
  const maxResults = Number.parseInt(env.AMAZON_CREATORS_MAX_RESULTS || String(AMAZON_CREATORS_MAX_RESULTS), 10)
  const credentialVersion = amazonCreatorsCredentialVersionSchema.safeParse(env.AMAZON_CREATORS_CREDENTIAL_VERSION || '3.2')

  if (marketplace !== AMAZON_CREATORS_MARKETPLACE && marketplace !== AMAZON_CREATORS_API_MARKETPLACE) {
    throw new Error('AMAZON_CREATORS_MARKETPLACE solo puede ser amazon.es para esta version.')
  }

  if (!Number.isInteger(maxResults) || maxResults < 1 || maxResults > AMAZON_CREATORS_MAX_RESULTS) {
    throw new Error(`AMAZON_CREATORS_MAX_RESULTS debe estar entre 1 y ${AMAZON_CREATORS_MAX_RESULTS}.`)
  }

  if (!credentialVersion.success) {
    throw new Error('AMAZON_CREATORS_CREDENTIAL_VERSION no es valida.')
  }

  const config: AmazonCreatorsConfig = {
    enabled: (env.AMAZON_CREATORS_ENABLED || 'false') === 'true',
    mode,
    marketplace: AMAZON_CREATORS_MARKETPLACE,
    apiMarketplace: AMAZON_CREATORS_API_MARKETPLACE,
    associateTag: env.AMAZON_ASSOCIATE_TAG || '',
    credentialId: env.AMAZON_CREATORS_CREDENTIAL_ID || '',
    credentialSecret: env.AMAZON_CREATORS_CREDENTIAL_SECRET || '',
    credentialVersion: credentialVersion.data,
    maxResults,
    timeoutMs: Number.parseInt(env.AMAZON_CREATORS_TIMEOUT_MS || '12000', 10),
    retries: Number.parseInt(env.AMAZON_CREATORS_RETRIES || '2', 10),
  }

  if (config.mode === 'live') {
    if (!config.enabled) {
      throw new Error('Amazon Creators API esta deshabilitada.')
    }

    if (!config.associateTag) {
      throw new Error('AMAZON_ASSOCIATE_TAG es obligatorio en modo live.')
    }

    if (!config.credentialId || !config.credentialSecret) {
      throw new Error('AMAZON_CREATORS_CREDENTIAL_ID y AMAZON_CREATORS_CREDENTIAL_SECRET son obligatorios en modo live.')
    }
  }

  return config
}

export function parseAmazonSearchResponse(payload: unknown) {
  return amazonCreatorsSearchResponseSchema.parse(payload) as unknown as AmazonCreatorsSearchResponse
}

export function parseAmazonGetItemsResponse(payload: unknown) {
  return amazonCreatorsGetItemsResponseSchema.parse(payload) as unknown as AmazonCreatorsGetItemsResponse
}
