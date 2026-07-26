import type { Article, Database, Product } from '../types/database'

type ProductRow = Database['public']['Tables']['products']['Row']
type ArticleRow = Database['public']['Tables']['articles']['Row']

export function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    shortDescription: row.short_description,
    description: row.description,
    category: row.category,
    affiliateUrl: row.affiliate_url,
    imageUrl: row.image_url,
    pros: row.pros,
    cons: row.cons,
    recommendedFor: row.recommended_for,
    featured: row.featured,
    published: row.published,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapArticle(row: ArticleRow): Article {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    coverImageUrl: row.cover_image_url,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    published: row.published,
    featured: row.featured,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
