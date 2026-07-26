import { z } from 'zod'
import type { Article, Product, ProductCategory } from '../types/database'
import { isAllowedAmazonSpainUrl } from './affiliate'
import { PRODUCT_CATEGORIES, isProductCategory } from './categories'

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export type AdminStatusFilter = 'all' | 'published' | 'draft'

export interface AdminProductPayload {
  name: string
  slug: string
  short_description: string
  description: string
  category: ProductCategory
  affiliate_url: string
  image_url: string | null
  pros: string[]
  cons: string[]
  recommended_for: string | null
  featured: boolean
  published: boolean
  sort_order: number
}

export interface AdminArticlePayload {
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image_url: string | null
  meta_title: string | null
  meta_description: string | null
  featured: boolean
  published: boolean
  published_at: string | null
  related_products: string[]
}

export interface AdminArticle extends Article {
  relatedProducts: string[]
}

export interface AdminDashboard {
  products: {
    total: number
    published: number
    draft: number
  }
  articles: {
    total: number
    published: number
    draft: number
  }
}

export interface AdminProductFilters {
  text?: string
  category?: ProductCategory | 'all'
  status?: AdminStatusFilter
}

export interface AdminArticleFilters {
  text?: string
  status?: AdminStatusFilter
}

function optionalHttpsUrl(fieldName: string) {
  return z
    .union([z.string(), z.null()])
    .transform((value) => value ?? '')
    .pipe(z.string().trim())
    .transform((value) => value || null)
    .refine((value) => {
      if (!value) {
        return true
      }

      try {
        return new URL(value).protocol === 'https:'
      } catch {
        return false
      }
    }, `${fieldName} debe ser una URL HTTPS.`)
}

function nullableTrimmedString(maxLength: number) {
  return z
    .union([z.string(), z.null()])
    .transform((value) => value ?? '')
    .pipe(z.string().trim().max(maxLength))
    .transform((value) => value || null)
}

function textArraySchema(fieldName: string) {
  return z
    .array(z.string())
    .transform((items) => items.map((item) => item.trim()).filter(Boolean))
    .refine((items) => items.every((item) => item.length <= 180), `${fieldName} contiene lineas demasiado largas.`)
}

export function normalizeSlug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const adminProductPayloadSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().transform(normalizeSlug).refine((value) => SLUG_REGEX.test(value), 'Slug no valido.'),
  short_description: z.string().trim().min(20).max(260),
  description: z.string().trim().min(30).max(4000),
  category: z.string().refine(isProductCategory, 'Categoria no valida.'),
  affiliate_url: z.string().trim().refine(isAllowedAmazonSpainUrl, 'La URL afiliada debe ser HTTPS y de Amazon Espana.'),
  image_url: optionalHttpsUrl('La imagen'),
  pros: textArraySchema('Ventajas'),
  cons: textArraySchema('Inconvenientes'),
  recommended_for: nullableTrimmedString(800),
  featured: z.boolean(),
  published: z.boolean(),
  sort_order: z.coerce.number().int().min(0).max(100000),
}) satisfies z.ZodType<AdminProductPayload>

export const adminArticlePayloadSchema = z.object({
  title: z.string().trim().min(3).max(180),
  slug: z.string().trim().transform(normalizeSlug).refine((value) => SLUG_REGEX.test(value), 'Slug no valido.'),
  excerpt: z.string().trim().min(20).max(320),
  content: z.string().trim().min(40).max(30000),
  cover_image_url: optionalHttpsUrl('La imagen de portada'),
  meta_title: nullableTrimmedString(70),
  meta_description: nullableTrimmedString(170),
  featured: z.boolean(),
  published: z.boolean(),
  published_at: z.union([z.string(), z.null()]).transform((value) => value ?? '').pipe(z.string().trim()).transform((value) => value || null),
  related_products: z.array(z.uuid()).transform((ids) => [...new Set(ids)]),
}) satisfies z.ZodType<AdminArticlePayload>

export function parseAdminProductPayload(payload: unknown): AdminProductPayload {
  return adminProductPayloadSchema.parse(payload)
}

export function parseAdminArticlePayload(payload: unknown): AdminArticlePayload {
  return adminArticlePayloadSchema.parse(payload)
}

export function filterAdminProducts(products: Product[], filters: AdminProductFilters): Product[] {
  const text = filters.text?.trim().toLowerCase() ?? ''
  const category = filters.category ?? 'all'
  const status = filters.status ?? 'all'

  return products.filter((product) => {
    const matchesText = !text
      || product.name.toLowerCase().includes(text)
      || product.slug.toLowerCase().includes(text)
      || product.shortDescription.toLowerCase().includes(text)
    const matchesCategory = category === 'all' || product.category === category
    const matchesStatus = status === 'all'
      || (status === 'published' && product.published)
      || (status === 'draft' && !product.published)

    return matchesText && matchesCategory && matchesStatus
  })
}

export function filterAdminArticles(articles: Article[], filters: AdminArticleFilters): Article[] {
  const text = filters.text?.trim().toLowerCase() ?? ''
  const status = filters.status ?? 'all'

  return articles.filter((article) => {
    const matchesText = !text
      || article.title.toLowerCase().includes(text)
      || article.slug.toLowerCase().includes(text)
      || article.excerpt.toLowerCase().includes(text)
    const matchesStatus = status === 'all'
      || (status === 'published' && article.published)
      || (status === 'draft' && !article.published)

    return matchesText && matchesStatus
  })
}

export function hasUnsavedChanges(current: unknown, saved: unknown): boolean {
  return JSON.stringify(current) !== JSON.stringify(saved)
}

export function emptyAdminProductPayload(): AdminProductPayload {
  const defaultCategory = PRODUCT_CATEGORIES[0] ?? 'otros'

  return {
    name: '',
    slug: '',
    short_description: '',
    description: '',
    category: defaultCategory,
    affiliate_url: '',
    image_url: null,
    pros: [],
    cons: [],
    recommended_for: null,
    featured: false,
    published: false,
    sort_order: 0,
  }
}

export function emptyAdminArticlePayload(): AdminArticlePayload {
  return {
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    cover_image_url: null,
    meta_title: null,
    meta_description: null,
    featured: false,
    published: false,
    published_at: null,
    related_products: [],
  }
}

export function productToAdminPayload(product: Product): AdminProductPayload {
  return {
    name: product.name,
    slug: product.slug,
    short_description: product.shortDescription,
    description: product.description,
    category: product.category,
    affiliate_url: product.affiliateUrl,
    image_url: product.imageUrl,
    pros: product.pros,
    cons: product.cons,
    recommended_for: product.recommendedFor,
    featured: product.featured,
    published: product.published,
    sort_order: product.sortOrder,
  }
}

export function articleToAdminPayload(article: AdminArticle): AdminArticlePayload {
  return {
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    content: article.content,
    cover_image_url: article.coverImageUrl,
    meta_title: article.metaTitle,
    meta_description: article.metaDescription,
    featured: article.featured,
    published: article.published,
    published_at: article.publishedAt,
    related_products: article.relatedProducts,
  }
}
