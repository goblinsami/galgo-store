import { mkdtemp, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../../shared/types/database'
import type { SourceProduct } from '../../../shared/types/product-research'
import { ProductResearchService } from '../../../server/services/product-research/ProductResearchService'
import {
  getTokenEndpoint,
  serializeGetItemsRequest,
  serializeSearchItemsRequest,
  AmazonCreatorsClient,
} from '../../../server/services/product-research/sources/amazon/AmazonCreatorsClient'
import { mapAmazonProductToCandidate, validateAmazonCandidateForImport } from '../../../server/services/product-research/sources/amazon/amazonCreators.mapper'
import { getAmazonCreatorsConfig, parseAmazonSearchResponse } from '../../../server/services/product-research/sources/amazon/amazonCreators.schemas'
import type { AmazonCreatorsConfig, AmazonCreatorsItem } from '../../../server/services/product-research/sources/amazon/amazonCreators.types'
import { LocalCandidateStorage } from '../../../server/services/product-research/storage/LocalCandidateStorage'
import { makeCandidate, rankProductCandidates } from '../../../server/services/product-research/ranking/rankProductCandidates'
import type { ProductSource } from '../../../server/services/product-research/sources/ProductSource'

const OLD_ENV = process.env

beforeEach(() => {
  process.env = {
    ...OLD_ENV,
    AMAZON_CREATORS_MODE: 'fixture',
    AMAZON_CREATORS_MARKETPLACE: 'amazon.es',
    AMAZON_CREATORS_MAX_RESULTS: '10',
    AMAZON_ASSOCIATE_TAG: '',
  }
})

afterEach(() => {
  process.env = OLD_ENV
  vi.restoreAllMocks()
})

function baseConfig(overrides: Partial<AmazonCreatorsConfig> = {}): AmazonCreatorsConfig {
  return {
    enabled: true,
    mode: 'live',
    marketplace: 'amazon.es',
    apiMarketplace: 'www.amazon.es',
    associateTag: 'galgo-21',
    credentialId: 'credential-id',
    credentialSecret: 'credential-secret',
    credentialVersion: '3.2',
    maxResults: 10,
    timeoutMs: 1000,
    retries: 0,
    ...overrides,
  }
}

function amazonItem(overrides: Partial<AmazonCreatorsItem> = {}): AmazonCreatorsItem {
  return {
    asin: 'B0GALGO001',
    parentASIN: 'B0PARENT001',
    detailPageURL: 'https://www.amazon.es/dp/B0GALGO001?tag=galgo-21&linkCode=ogi',
    images: {
      primary: {
        large: {
          url: 'https://m.media-amazon.com/images/I/test._SL500_.jpg',
        },
      },
      variants: [],
    },
    itemInfo: {
      title: {
        displayValue: 'Arnes antiescape para galgo de tres puntos',
      },
      byLineInfo: {
        brand: {
          displayValue: 'Marca',
        },
      },
      features: {
        displayValues: [
          'Para galgos y whippets de cuerpo delgado',
          'Medidas de cuello y pecho en cm',
          'Sistema antiescape de tres puntos',
        ],
      },
      classifications: {
        productGroup: {
          displayValue: 'Mascotas',
        },
      },
    },
    offersV2: {
      listings: [
        {
          availability: {
            message: 'Disponible',
          },
          price: {
            money: {
              amount: 25.5,
              currency: 'EUR',
            },
          },
        },
      ],
    },
    customerReviews: {
      count: 20,
      starRating: {
        value: 4.5,
      },
    },
    ...overrides,
  }
}

function sourceProduct(overrides: Partial<SourceProduct> = {}): SourceProduct {
  return mapAmazonProductToCandidate(amazonItem(overrides as Partial<AmazonCreatorsItem>), {
    query: 'arnes antiescape galgo',
    marketplace: 'amazon.es',
    associateTag: 'galgo-21',
    retrievedAt: '2026-07-26T10:00:00.000Z',
    fixture: false,
  })
}

describe('Amazon Creators client', () => {
  it('serializes SearchItems and GetItems with lowerCamelCase fields', () => {
    expect(serializeSearchItemsRequest({
      keywords: 'arnes galgo',
      itemCount: 20,
      marketplace: 'www.amazon.es',
      partnerTag: 'galgo-21',
    })).toMatchObject({
      keywords: 'arnes galgo',
      itemCount: 10,
      marketplace: 'www.amazon.es',
      partnerTag: 'galgo-21',
    })

    expect(serializeGetItemsRequest({
      itemIds: ['B0GALGO001'],
      marketplace: 'www.amazon.es',
      partnerTag: 'galgo-21',
    })).toMatchObject({
      itemIds: ['B0GALGO001'],
      itemIdType: 'ASIN',
      marketplace: 'www.amazon.es',
      partnerTag: 'galgo-21',
    })
  })

  it('authenticates with OAuth and caches the token without logging secrets', async () => {
    const logs: string[] = []
    const fetcher = vi.fn(async () => new Response(JSON.stringify({
      access_token: 'token-value',
      expires_in: 3600,
    }), { status: 200 }))
    vi.spyOn(console, 'error').mockImplementation((message) => logs.push(String(message)))

    const client = new AmazonCreatorsClient(baseConfig(), fetcher)
    await expect(client.getAccessTokenForTest()).resolves.toBe('token-value')
    await expect(client.getAccessTokenForTest()).resolves.toBe('token-value')

    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(fetcher.mock.calls[0]?.[0]).toBe(getTokenEndpoint('3.2'))
    expect(logs.join(' ')).not.toContain('credential-secret')
  })

  it('validates Creators API responses', () => {
    expect(parseAmazonSearchResponse({ searchResult: { items: [amazonItem()] } }).searchResult?.items).toHaveLength(1)
    expect(() => parseAmazonSearchResponse({ searchResult: { items: 'bad' } })).toThrow()
  })

  it('validates startup configuration for live mode', () => {
    expect(() => getAmazonCreatorsConfig({
      AMAZON_CREATORS_MODE: 'live',
      AMAZON_CREATORS_ENABLED: 'true',
      AMAZON_CREATORS_MARKETPLACE: 'amazon.com',
      AMAZON_ASSOCIATE_TAG: 'galgo-21',
      AMAZON_CREATORS_CREDENTIAL_ID: 'id',
      AMAZON_CREATORS_CREDENTIAL_SECRET: 'secret',
    })).toThrow(/amazon\.es/)

    expect(() => getAmazonCreatorsConfig({
      AMAZON_CREATORS_MODE: 'live',
      AMAZON_CREATORS_ENABLED: 'true',
      AMAZON_CREATORS_MARKETPLACE: 'amazon.es',
      AMAZON_ASSOCIATE_TAG: 'galgo-21',
      AMAZON_CREATORS_CREDENTIAL_ID: 'id',
      AMAZON_CREATORS_CREDENTIAL_SECRET: 'secret',
    })).not.toThrow()
  })
})

describe('Amazon Creators mapper', () => {
  it('maps Amazon products without inventing missing facts', () => {
    const candidate = sourceProduct()
    expect(candidate.asin).toBe('B0GALGO001')
    expect(candidate.marketplace).toBe('amazon.es')
    expect(candidate.price).toMatchObject({ amount: 25.5, currency: 'EUR' })
    expect(candidate.imageUrl).toContain('m.media-amazon.com')
    expect(candidate.rawFacts.join(' ')).toContain('Arnes antiescape')
  })

  it('keeps missing price and image as null', () => {
    const candidate = mapAmazonProductToCandidate(amazonItem({
      images: { primary: {} },
      offersV2: { listings: [{ availability: { message: 'Disponible' } }] },
    }), {
      query: 'cama para galgo',
      marketplace: 'amazon.es',
      associateTag: 'galgo-21',
      retrievedAt: '2026-07-26T10:00:00.000Z',
      fixture: false,
    })

    expect(candidate.price.amount).toBeNull()
    expect(candidate.price.currency).toBeNull()
    expect(candidate.imageUrl).toBeNull()
  })

  it('rejects wrong affiliate marketplace and wrong associate tag', () => {
    expect(() => mapAmazonProductToCandidate(amazonItem({
      detailPageURL: 'https://www.amazon.de/dp/B0GALGO001?tag=galgo-21',
    }), {
      query: 'arnes',
      marketplace: 'amazon.es',
      associateTag: 'galgo-21',
      retrievedAt: '2026-07-26T10:00:00.000Z',
      fixture: false,
    })).toThrow(/Amazon Espana/)

    expect(() => validateAmazonCandidateForImport({
      sourceApi: 'amazon-creators-api',
      asin: 'B0GALGO001',
      marketplace: 'amazon.es',
      affiliateUrl: 'https://www.amazon.es/dp/B0GALGO001?tag=otro-21',
    }, 'galgo-21')).toThrow(/tracking/)
  })
})

describe('Product candidate ranking', () => {
  it('deduplicates by ASIN and ranks by suitability', () => {
    const strong = makeCandidate(sourceProduct(), {
      query: 'arnes antiescape galgo',
      category: 'arneses',
      fixture: false,
    })
    const duplicate = { ...strong, id: 'duplicate', totalScore: 0 }
    const weak = makeCandidate(sourceProduct({
      asin: 'B0GALGO009',
      parentASIN: 'B0OTHER000',
      detailPageURL: 'https://www.amazon.es/dp/B0GALGO009?tag=galgo-21&linkCode=ogi',
      itemInfo: {
        title: { displayValue: 'Cama basica para perro' },
        features: { displayValues: ['Superficie amplia'] },
      },
    } as Partial<AmazonCreatorsItem>), {
      query: 'arnes antiescape galgo',
      category: 'camas',
      fixture: false,
    })

    const ranked = rankProductCandidates([weak, duplicate, strong], 10)
    expect(ranked).toHaveLength(2)
    expect(ranked[0]?.asin).toBe(strong.asin)
    expect(weak.suitabilityStatus).toBe('manual_review_required')
  })
})

describe('Local storage and research service', () => {
  let rootDir: string

  beforeEach(async () => {
    rootDir = await mkdtemp(join(tmpdir(), 'galgo-research-'))
  })

  afterEach(async () => {
    await rm(rootDir, { recursive: true, force: true })
  })

  it('writes latest and run files atomically with fixture candidates', async () => {
    const storage = new LocalCandidateStorage(rootDir)
    const service = new ProductResearchService(undefined, storage)

    const run = await service.run({ query: 'arnes antiescape galgo', limit: 10 })
    const latest = await storage.readLatest()

    expect(run.mode).toBe('fixture')
    expect(run.candidates.length).toBeGreaterThan(0)
    expect(latest?.runId).toBe(run.runId)
    expect(run.candidates.every((candidate) => candidate.fixture)).toBe(true)
  })

  it('imports a candidate as draft, blocks double import and does not delete mocks', async () => {
    const storage = new LocalCandidateStorage(rootDir)
    const candidate = makeCandidate(sourceProduct(), {
      query: 'arnes antiescape galgo',
      category: 'arneses',
      fixture: false,
    })
    await storage.saveRun({
      runId: 'run-test',
      createdAt: '2026-07-26T10:00:00.000Z',
      source: 'amazon',
      marketplace: 'amazon.es',
      mode: 'fixture',
      queries: [{ query: candidate.query, category: candidate.category }],
      candidates: [candidate],
      errors: [],
    })

    const calls: string[] = []
    const fakeSupabase = {
      from(table: string) {
        calls.push(`from:${table}`)
        return {
          select() {
            return this
          },
          eq() {
            return {
              maybeSingle: async () => ({ data: null, error: null }),
            }
          },
          insert(payload: Database['public']['Tables']['products']['Insert']) {
            calls.push(`insert:${payload.published ? 'published' : 'draft'}`)
            return {
              select() {
                return {
                  single: async () => ({ data: { id: 'new-product-id', slug: payload.slug }, error: null }),
                }
              },
            }
          },
          delete() {
            calls.push('delete')
            return this
          },
        }
      },
    } as unknown as SupabaseClient<Database>

    const service = new ProductResearchService({} as ProductSource, storage)
    const imported = await service.importCandidateAsDraft(candidate.id, fakeSupabase)

    await expect(service.importCandidateAsDraft(candidate.id, fakeSupabase)).rejects.toThrow(/ya fue importado/)
    expect(imported.slug).toBe('arnes-antiescape-para-galgo-de-tres-puntos')
    expect(calls).toContain('insert:draft')
    expect(calls).not.toContain('delete')
  })
})
