import { describe, expect, it } from 'vitest'
import { isAllowedAmazonSpainUrl } from '../../shared/utils/affiliate'

describe('Amazon Spain affiliate URL validation', () => {
  it('accepts only HTTPS URLs on exact Amazon Spain domains', () => {
    expect(isAllowedAmazonSpainUrl('https://www.amazon.es/dp/ASIN_EJEMPLO_1?tag=AFFILIATE_TAG')).toBe(true)
    expect(isAllowedAmazonSpainUrl('https://amazon.es/dp/ASIN_EJEMPLO_1?tag=AFFILIATE_TAG')).toBe(true)
  })

  it('rejects weak domain matches and non-HTTPS protocols', () => {
    expect(isAllowedAmazonSpainUrl('http://www.amazon.es/dp/example')).toBe(false)
    expect(isAllowedAmazonSpainUrl('https://amazon.es.example.com/dp/example')).toBe(false)
    expect(isAllowedAmazonSpainUrl('https://evil-amazon.es/dp/example')).toBe(false)
    expect(isAllowedAmazonSpainUrl('not-a-url')).toBe(false)
  })
})
