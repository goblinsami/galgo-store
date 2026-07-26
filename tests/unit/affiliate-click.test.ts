import { describe, expect, it } from 'vitest'
import { parseAffiliateClickPayload } from '../../shared/utils/affiliate-click'

describe('affiliate click payload validation', () => {
  it('accepts valid endpoint payloads', () => {
    expect(parseAffiliateClickPayload({
      productId: '00000000-0000-4000-8000-000000000001',
      sourcePage: '/productos/arnes-antiescape',
      utmSource: 'instagram',
      utmMedium: 'social',
      utmCampaign: 'mvp',
      utmContent: 'reel-01',
    })).toMatchObject({
      productId: '00000000-0000-4000-8000-000000000001',
      sourcePage: '/productos/arnes-antiescape',
    })
  })

  it('rejects invalid UUIDs and external source pages', () => {
    expect(() => parseAffiliateClickPayload({
      productId: 'not-a-uuid',
      sourcePage: '/productos/arnes',
    })).toThrow()

    expect(() => parseAffiliateClickPayload({
      productId: '00000000-0000-4000-8000-000000000001',
      sourcePage: 'https://example.com/productos/arnes',
    })).toThrow()
  })
})
