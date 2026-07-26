import { describe, expect, it } from 'vitest'
import type { Article, Product } from '../../shared/types/database'
import {
  adminArticlePayloadSchema,
  adminProductPayloadSchema,
  filterAdminArticles,
  filterAdminProducts,
  hasUnsavedChanges,
  normalizeSlug,
} from '../../shared/utils/admin-content'

const product: Product = {
  id: '00000000-0000-4000-8000-000000000001',
  name: 'Arnes seguro',
  slug: 'arnes-seguro',
  shortDescription: 'Arnes pensado para galgos estrechos',
  description: 'Descripcion suficientemente larga para validar correctamente el producto.',
  category: 'arneses',
  affiliateUrl: 'https://www.amazon.es/dp/ASIN?tag=tag',
  imageUrl: null,
  pros: ['Ajustable'],
  cons: ['Requiere medida'],
  recommendedFor: null,
  featured: false,
  published: false,
  sortOrder: 0,
  createdAt: '2026-07-25T10:00:00.000Z',
  updatedAt: '2026-07-25T10:00:00.000Z',
}

const article: Article = {
  id: '00000000-0000-4000-8000-000000000101',
  title: 'Guia de arneses',
  slug: 'guia-arneses',
  excerpt: 'Extracto suficientemente descriptivo para validar correctamente.',
  content: '# Guia\n\nContenido suficientemente largo para validar correctamente.',
  coverImageUrl: null,
  metaTitle: null,
  metaDescription: null,
  published: true,
  featured: false,
  publishedAt: '2026-07-25T10:00:00.000Z',
  createdAt: '2026-07-25T10:00:00.000Z',
  updatedAt: '2026-07-25T10:00:00.000Z',
}

describe('admin content utilities', () => {
  it('normalizes slugs from Spanish text', () => {
    expect(normalizeSlug(' Arnés Antiescape para Galgos ')).toBe('arnes-antiescape-para-galgos')
  })

  it('validates products and Amazon Spain HTTPS URLs', () => {
    const valid = adminProductPayloadSchema.safeParse({
      name: product.name,
      slug: product.slug,
      short_description: product.shortDescription,
      description: product.description,
      category: product.category,
      affiliate_url: product.affiliateUrl,
      image_url: null,
      pros: product.pros,
      cons: product.cons,
      recommended_for: null,
      featured: product.featured,
      published: product.published,
      sort_order: product.sortOrder,
    })
    const invalidUrl = adminProductPayloadSchema.safeParse({
      name: product.name,
      slug: product.slug,
      short_description: product.shortDescription,
      description: product.description,
      category: product.category,
      affiliate_url: 'https://example.com/producto',
      image_url: null,
      pros: product.pros,
      cons: product.cons,
      recommended_for: null,
      featured: product.featured,
      published: product.published,
      sort_order: product.sortOrder,
    })

    expect(valid.success).toBe(true)
    expect(invalidUrl.success).toBe(false)
  })

  it('validates articles and rejects unsafe relation IDs', () => {
    const valid = adminArticlePayloadSchema.safeParse({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      cover_image_url: null,
      meta_title: null,
      meta_description: null,
      featured: article.featured,
      published: article.published,
      published_at: article.publishedAt,
      related_products: ['00000000-0000-4000-8000-000000000001'],
    })
    const invalid = adminArticlePayloadSchema.safeParse({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      cover_image_url: null,
      meta_title: null,
      meta_description: null,
      featured: article.featured,
      published: article.published,
      published_at: article.publishedAt,
      related_products: ['not-a-uuid'],
    })

    expect(valid.success).toBe(true)
    expect(invalid.success).toBe(false)
  })

  it('filters admin products and articles', () => {
    expect(filterAdminProducts([product], { text: 'arnes', category: 'arneses', status: 'draft' })).toHaveLength(1)
    expect(filterAdminProducts([product], { status: 'published' })).toHaveLength(0)
    expect(filterAdminArticles([article], { text: 'arneses', status: 'published' })).toHaveLength(1)
    expect(filterAdminArticles([article], { status: 'draft' })).toHaveLength(0)
  })

  it('detects unsaved changes', () => {
    expect(hasUnsavedChanges({ title: 'A' }, { title: 'A' })).toBe(false)
    expect(hasUnsavedChanges({ title: 'B' }, { title: 'A' })).toBe(true)
  })
})
