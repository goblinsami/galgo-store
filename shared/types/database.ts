export type ProductCategory =
  | 'arneses'
  | 'collares'
  | 'abrigos'
  | 'camas'
  | 'alimentacion'
  | 'viajes'
  | 'higiene'
  | 'otros'

export interface Product {
  id: string
  name: string
  slug: string
  shortDescription: string
  description: string
  category: ProductCategory
  affiliateUrl: string
  imageUrl: string | null
  pros: string[]
  cons: string[]
  recommendedFor: string | null
  featured: boolean
  published: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImageUrl: string | null
  metaTitle: string | null
  metaDescription: string | null
  published: boolean
  featured: boolean
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ArticleWithProducts extends Article {
  products: Product[]
}

export interface AffiliateClickPayload {
  productId: string
  sourcePage?: string | undefined
  utmSource?: string | undefined
  utmMedium?: string | undefined
  utmCampaign?: string | undefined
  utmContent?: string | undefined
}

export interface Database {
  public: {
    Enums: {
      product_category: ProductCategory
    }
    Tables: {
      products: {
        Row: {
          id: string
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
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          short_description: string
          description: string
          category: ProductCategory
          affiliate_url: string
          image_url?: string | null
          pros?: string[]
          cons?: string[]
          recommended_for?: string | null
          featured?: boolean
          published?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['products']['Insert']>
        Relationships: []
      }
      articles: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string
          content: string
          cover_image_url: string | null
          meta_title: string | null
          meta_description: string | null
          published: boolean
          featured: boolean
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          excerpt: string
          content: string
          cover_image_url?: string | null
          meta_title?: string | null
          meta_description?: string | null
          published?: boolean
          featured?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['articles']['Insert']>
        Relationships: []
      }
      article_products: {
        Row: {
          article_id: string
          product_id: string
          sort_order: number
        }
        Insert: {
          article_id: string
          product_id: string
          sort_order?: number
        }
        Update: Partial<Database['public']['Tables']['article_products']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'article_products_article_id_fkey'
            columns: ['article_id']
            isOneToOne: false
            referencedRelation: 'articles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'article_products_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }
      affiliate_clicks: {
        Row: {
          id: string
          product_id: string | null
          source_page: string | null
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          utm_content: string | null
          referrer: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id?: string | null
          source_page?: string | null
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          referrer?: string | null
          created_at?: string
        }
        Update: never
        Relationships: [
          {
            foreignKeyName: 'affiliate_clicks_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
