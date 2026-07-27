import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import {
  AMAZON_CREATORS_API_BASE_URL,
  AMAZON_CREATORS_RESOURCES,
  parseAmazonGetItemsResponse,
  parseAmazonSearchResponse,
} from './amazonCreators.schemas'
import type {
  AmazonCreatorsConfig,
  AmazonCreatorsGetItemsResponse,
  AmazonCreatorsSearchResponse,
} from './amazonCreators.types'

interface TokenState {
  accessToken: string
  expiresAt: number
}

export interface AmazonCreatorsFetch {
  (input: string, init: RequestInit): Promise<Response>
}

export function serializeSearchItemsRequest(input: {
  keywords: string
  itemCount: number
  marketplace: string
  partnerTag: string
}) {
  return {
    keywords: input.keywords,
    itemCount: Math.min(Math.max(input.itemCount, 1), 10),
    marketplace: input.marketplace,
    partnerTag: input.partnerTag,
    resources: [...AMAZON_CREATORS_RESOURCES],
  }
}

export function serializeGetItemsRequest(input: {
  itemIds: string[]
  marketplace: string
  partnerTag: string
}) {
  return {
    itemIds: input.itemIds.slice(0, 10),
    itemIdType: 'ASIN',
    marketplace: input.marketplace,
    partnerTag: input.partnerTag,
    resources: [...AMAZON_CREATORS_RESOURCES],
  }
}

export function getTokenEndpoint(version: AmazonCreatorsConfig['credentialVersion']): string {
  if (version === '2.2') {
    return 'https://creatorsapi.auth.eu-south-2.amazoncognito.com/oauth2/token'
  }

  if (version === '3.2') {
    return 'https://api.amazon.co.uk/auth/o2/token'
  }

  if (version === '2.1') {
    return 'https://creatorsapi.auth.us-east-1.amazoncognito.com/oauth2/token'
  }

  if (version === '2.3') {
    return 'https://creatorsapi.auth.us-west-2.amazoncognito.com/oauth2/token'
  }

  if (version === '3.1') {
    return 'https://api.amazon.com/auth/o2/token'
  }

  return 'https://api.amazon.co.jp/auth/o2/token'
}

function isV2Credential(version: AmazonCreatorsConfig['credentialVersion']): boolean {
  return version.startsWith('2.')
}

function fixturePath(name: string): string {
  return fileURLToPath(new URL(`../../fixtures/${name}`, import.meta.url))
}

async function readFixture<T>(name: string, parser: (payload: unknown) => T): Promise<T> {
  const raw = await readFile(fixturePath(name), 'utf8')
  return parser(JSON.parse(raw))
}

export class AmazonCreatorsClient {
  private tokenState: TokenState | null = null

  constructor(
    private readonly config: AmazonCreatorsConfig,
    private readonly fetcher: AmazonCreatorsFetch = fetch,
  ) {}

  async searchItems(input: { keywords: string, limit: number }): Promise<AmazonCreatorsSearchResponse> {
    if (this.config.mode === 'fixture') {
      return await readFixture('amazon-creators-search-items.fixture.json', parseAmazonSearchResponse)
    }

    return await this.request('/catalog/v1/searchItems', serializeSearchItemsRequest({
      keywords: input.keywords,
      itemCount: Math.min(input.limit, this.config.maxResults),
      marketplace: this.config.apiMarketplace,
      partnerTag: this.config.associateTag,
    }), parseAmazonSearchResponse)
  }

  async getItems(input: { itemIds: string[] }): Promise<AmazonCreatorsGetItemsResponse> {
    if (this.config.mode === 'fixture') {
      return await readFixture('amazon-creators-get-items.fixture.json', parseAmazonGetItemsResponse)
    }

    return await this.request('/catalog/v1/getItems', serializeGetItemsRequest({
      itemIds: input.itemIds,
      marketplace: this.config.apiMarketplace,
      partnerTag: this.config.associateTag,
    }), parseAmazonGetItemsResponse)
  }

  async getAccessTokenForTest(): Promise<string> {
    return await this.getAccessToken()
  }

  private async request<T>(path: string, body: unknown, parser: (payload: unknown) => T): Promise<T> {
    return await this.withRetries(async () => {
      const token = await this.getAccessToken()
      const response = await this.fetcher(`${AMAZON_CREATORS_API_BASE_URL}${path}`, {
        method: 'POST',
        headers: {
          authorization: isV2Credential(this.config.credentialVersion)
            ? `Bearer ${token}, Version ${this.config.credentialVersion}`
            : `Bearer ${token}`,
          'content-type': 'application/json',
          'x-marketplace': this.config.apiMarketplace,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(this.config.timeoutMs),
      })

      if (!response.ok) {
        throw new Error(this.statusMessage(response.status))
      }

      return parser(await response.json())
    })
  }

  private async getAccessToken(): Promise<string> {
    const now = Date.now()
    if (this.tokenState && this.tokenState.expiresAt > now + 30_000) {
      return this.tokenState.accessToken
    }

    const endpoint = getTokenEndpoint(this.config.credentialVersion)
    const response = await this.fetcher(endpoint, this.buildTokenRequest())

    if (!response.ok) {
      throw new Error(`No se pudo autenticar con Amazon Creators API: HTTP ${response.status}.`)
    }

    const payload = await response.json() as { access_token?: unknown, expires_in?: unknown }
    if (typeof payload.access_token !== 'string') {
      throw new Error('La respuesta de autenticacion de Amazon no incluye access_token.')
    }

    const expiresIn = typeof payload.expires_in === 'number' ? payload.expires_in : 3600
    this.tokenState = {
      accessToken: payload.access_token,
      expiresAt: now + expiresIn * 1000,
    }

    return payload.access_token
  }

  private buildTokenRequest(): RequestInit {
    if (isV2Credential(this.config.credentialVersion)) {
      return {
        method: 'POST',
        headers: {
          authorization: `Basic ${Buffer.from(`${this.config.credentialId}:${this.config.credentialSecret}`).toString('base64')}`,
          'content-type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          scope: 'creatorsapi/default',
        }),
        signal: AbortSignal.timeout(this.config.timeoutMs),
      }
    }

    return {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: this.config.credentialId,
        client_secret: this.config.credentialSecret,
        scope: 'creatorsapi::default',
      }),
      signal: AbortSignal.timeout(this.config.timeoutMs),
    }
  }

  private async withRetries<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: unknown
    for (let attempt = 0; attempt <= this.config.retries; attempt += 1) {
      try {
        return await operation()
      } catch (error) {
        lastError = error
        if (attempt >= this.config.retries || !this.isRetryableError(error)) {
          break
        }

        await new Promise((resolve) => setTimeout(resolve, 200 * 2 ** attempt))
      }
    }

    throw lastError
  }

  private isRetryableError(error: unknown): boolean {
    if (!(error instanceof Error)) {
      return false
    }

    return /HTTP (429|5\d\d)|timeout|aborted/i.test(error.message)
  }

  private statusMessage(status: number): string {
    if (status === 401 || status === 403) {
      return `Amazon Creators API denego el acceso: HTTP ${status}.`
    }

    if (status === 429) {
      return 'Amazon Creators API aplico rate limit: HTTP 429.'
    }

    return `Amazon Creators API respondio con HTTP ${status}.`
  }
}
