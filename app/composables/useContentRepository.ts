import type { SupabaseClient } from '@supabase/supabase-js'
import type { Article, Database, Product, ProductCategory } from '~~/shared/types/database'
import { mapArticle, mapProduct } from '~~/shared/utils/mappers'

type RepositoryResult<T> = {
  data: T
  error: string | null
  configMissing: boolean
}

function emptyResult<T>(data: T, configMissing = false): RepositoryResult<T> {
  return {
    data,
    error: null,
    configMissing,
  }
}

function errorResult<T>(data: T, message: string): RepositoryResult<T> {
  return {
    data,
    error: message,
    configMissing: false,
  }
}

export function useContentRepository() {
  const client = useSupabaseClient<Database>() as SupabaseClient<Database>
  const { hasSupabaseConfig } = useSupabaseStatus()

  async function getProducts(category?: ProductCategory): Promise<RepositoryResult<Product[]>> {
    if (!hasSupabaseConfig.value) {
      return emptyResult([], true)
    }

    let query = client
      .from('products')
      .select('*')
      .eq('published', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query
    if (error) {
      return errorResult([], 'No se han podido cargar los productos.')
    }

    return emptyResult((data ?? []).map(mapProduct))
  }

  async function getFeaturedProducts(): Promise<RepositoryResult<Product[]>> {
    if (!hasSupabaseConfig.value) {
      return emptyResult([], true)
    }

    const { data, error } = await client
      .from('products')
      .select('*')
      .eq('published', true)
      .eq('featured', true)
      .order('sort_order', { ascending: true })
      .limit(6)

    if (error) {
      return errorResult([], 'No se han podido cargar los productos destacados.')
    }

    return emptyResult((data ?? []).map(mapProduct))
  }

  async function getProductBySlug(slug: string): Promise<RepositoryResult<Product | null>> {
    if (!hasSupabaseConfig.value) {
      return emptyResult(null, true)
    }

    const { data, error } = await client
      .from('products')
      .select('*')
      .eq('published', true)
      .eq('slug', slug)
      .maybeSingle()

    if (error) {
      return errorResult(null, 'No se ha podido cargar el producto.')
    }

    return emptyResult(data ? mapProduct(data) : null)
  }

  async function getArticles(): Promise<RepositoryResult<Article[]>> {
    if (!hasSupabaseConfig.value) {
      return emptyResult([], true)
    }

    const { data, error } = await client
      .from('articles')
      .select('*')
      .eq('published', true)
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (error) {
      return errorResult([], 'No se han podido cargar las guias.')
    }

    return emptyResult((data ?? []).map(mapArticle))
  }

  async function getFeaturedArticles(): Promise<RepositoryResult<Article[]>> {
    if (!hasSupabaseConfig.value) {
      return emptyResult([], true)
    }

    const { data, error } = await client
      .from('articles')
      .select('*')
      .eq('published', true)
      .eq('featured', true)
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(4)

    if (error) {
      return errorResult([], 'No se han podido cargar las guias destacadas.')
    }

    return emptyResult((data ?? []).map(mapArticle))
  }

  async function getArticleBySlug(slug: string): Promise<RepositoryResult<Article | null>> {
    if (!hasSupabaseConfig.value) {
      return emptyResult(null, true)
    }

    const { data, error } = await client
      .from('articles')
      .select('*')
      .eq('published', true)
      .eq('slug', slug)
      .maybeSingle()

    if (error) {
      return errorResult(null, 'No se ha podido cargar la guia.')
    }

    return emptyResult(data ? mapArticle(data) : null)
  }

  async function getRelatedProductsForArticle(articleId: string): Promise<RepositoryResult<Product[]>> {
    if (!hasSupabaseConfig.value) {
      return emptyResult([], true)
    }

    const relations = await client
      .from('article_products')
      .select('product_id, sort_order')
      .eq('article_id', articleId)
      .order('sort_order', { ascending: true })

    if (relations.error) {
      return errorResult([], 'No se han podido cargar los productos relacionados.')
    }

    const productIds = (relations.data ?? []).map((relation) => relation.product_id)
    if (productIds.length === 0) {
      return emptyResult([])
    }

    const { data, error } = await client
      .from('products')
      .select('*')
      .eq('published', true)
      .in('id', productIds)

    if (error) {
      return errorResult([], 'No se han podido cargar los productos relacionados.')
    }

    const mapped = (data ?? []).map(mapProduct)
    const ordered = productIds
      .map((id) => mapped.find((product) => product.id === id))
      .filter((product): product is Product => Boolean(product))

    return emptyResult(ordered)
  }

  async function getRelatedArticlesForProduct(productId: string): Promise<RepositoryResult<Article[]>> {
    if (!hasSupabaseConfig.value) {
      return emptyResult([], true)
    }

    const relations = await client
      .from('article_products')
      .select('article_id, sort_order')
      .eq('product_id', productId)
      .order('sort_order', { ascending: true })

    if (relations.error) {
      return errorResult([], 'No se han podido cargar las guias relacionadas.')
    }

    const articleIds = (relations.data ?? []).map((relation) => relation.article_id)
    if (articleIds.length === 0) {
      return emptyResult([])
    }

    const { data, error } = await client
      .from('articles')
      .select('*')
      .eq('published', true)
      .in('id', articleIds)

    if (error) {
      return errorResult([], 'No se han podido cargar las guias relacionadas.')
    }

    const mapped = (data ?? []).map(mapArticle)
    const ordered = articleIds
      .map((id) => mapped.find((article) => article.id === id))
      .filter((article): article is Article => Boolean(article))

    return emptyResult(ordered)
  }

  return {
    getProducts,
    getFeaturedProducts,
    getProductBySlug,
    getArticles,
    getFeaturedArticles,
    getArticleBySlug,
    getRelatedProductsForArticle,
    getRelatedArticlesForProduct,
  }
}
