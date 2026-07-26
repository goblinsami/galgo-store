import { describe, expect, it } from 'vitest'
import type { Database } from '../../shared/types/database'
import { mapProduct } from '../../shared/utils/mappers'

type ProductRow = Database['public']['Tables']['products']['Row']

describe('data mappers', () => {
  it('maps product rows to safe frontend product shape', () => {
    const row: ProductRow = {
      id: '00000000-0000-4000-8000-000000000001',
      name: 'Arnes',
      slug: 'arnes',
      short_description: 'Corto',
      description: 'Largo',
      category: 'arneses',
      affiliate_url: 'https://www.amazon.es/dp/ASIN?tag=AFFILIATE_TAG',
      image_url: null,
      pros: ['Ajustable'],
      cons: ['Medir antes'],
      recommended_for: 'Galgos adultos',
      featured: true,
      published: true,
      sort_order: 1,
      created_at: '2026-07-25T00:00:00Z',
      updated_at: '2026-07-25T00:00:00Z',
    }

    expect(mapProduct(row)).toMatchObject({
      shortDescription: 'Corto',
      affiliateUrl: row.affiliate_url,
      imageUrl: null,
      recommendedFor: 'Galgos adultos',
    })
  })
})
