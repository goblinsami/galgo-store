import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, ProductCategory } from '../../../shared/types/database'
import type { ProductCandidate, ProductResearchRun } from '../../../shared/types/product-research'
import { normalizeSlug } from '../../../shared/utils/admin-content'
import { getAmazonCreatorsConfig } from './sources/amazon/amazonCreators.schemas'
import { validateAmazonCandidateForImport } from './sources/amazon/amazonCreators.mapper'
import { AmazonCreatorsSource } from './sources/amazon/AmazonCreatorsSource'
import type { ProductSource } from './sources/ProductSource'
import { INITIAL_SIGHTHOUND_SEARCHES, makeCandidate, rankProductCandidates } from './ranking/rankProductCandidates'
import { LocalCandidateStorage } from './storage/LocalCandidateStorage'

interface RunInput {
  query?: string | undefined
  category?: ProductCategory | undefined
  limit?: number | undefined
}

interface ImportResult {
  candidate: ProductCandidate
  productId: string
  slug: string
}

function clampLimit(limit: number | undefined, max: number): number {
  if (!limit || !Number.isFinite(limit)) {
    return max
  }

  return Math.max(1, Math.min(Math.trunc(limit), max))
}

function pickQueries(input: RunInput) {
  if (input.query) {
    return [{
      query: input.query.trim(),
      category: input.category ?? inferCategory(input.query),
    }]
  }

  if (input.category) {
    return INITIAL_SIGHTHOUND_SEARCHES.filter((item) => item.category === input.category).slice(0, 2)
  }

  return INITIAL_SIGHTHOUND_SEARCHES.slice(0, 3)
}

function inferCategory(query: string): ProductCategory {
  const clean = query.toLowerCase()
  if (clean.includes('arnes') || clean.includes('harness')) return 'arneses'
  if (clean.includes('collar') || clean.includes('martingale')) return 'collares'
  if (clean.includes('abrigo') || clean.includes('coat') || clean.includes('impermeable') || clean.includes('clothes')) return 'abrigos'
  if (clean.includes('cama')) return 'camas'
  return 'otros'
}

function truncate(value: string, max: number): string {
  return value.length <= max ? value : `${value.slice(0, max - 1).trim()}...`
}

function makeShortDescription(candidate: ProductCandidate): string {
  const base = candidate.features[0] ?? candidate.title
  const sentence = `Borrador importado desde Amazon Creators API para revision editorial: ${base}`
  return truncate(sentence, 260)
}

function makeDescription(candidate: ProductCandidate): string {
  const facts = candidate.rawFacts.slice(0, 8).map((fact) => `- ${fact}`).join('\n')
  const warnings = candidate.suitabilityWarnings.length
    ? candidate.suitabilityWarnings.map((warning) => `- ${warning}`).join('\n')
    : '- Pendiente de revision editorial antes de publicar.'

  return `# ${candidate.title}

Borrador generado desde Amazon Creators API. No esta publicado y requiere revision humana antes de aparecer en la web.

## Procedencia

- Fuente: Amazon Creators API
- Marketplace: ${candidate.marketplace}
- ASIN: ${candidate.asin}
- Obtenido: ${candidate.retrievedAt}

## Hechos de Amazon

${facts || '- Sin hechos adicionales disponibles.'}

## Advertencias editoriales

${warnings}`
}

async function uniqueSlug(supabase: SupabaseClient<Database>, name: string): Promise<string> {
  const base = normalizeSlug(name).slice(0, 80) || 'producto-amazon'
  for (let index = 0; index < 50; index += 1) {
    const slug = index === 0 ? base : `${base}-${index + 1}`
    const duplicate = await supabase.from('products').select('id').eq('slug', slug).maybeSingle()
    if (duplicate.error) {
      throw new Error('No se ha podido comprobar el slug.')
    }

    if (!duplicate.data) {
      return slug
    }
  }

  throw new Error('No se pudo generar un slug unico.')
}

export class ProductResearchService {
  private readonly config = getAmazonCreatorsConfig()

  constructor(
    private readonly source: ProductSource = new AmazonCreatorsSource(),
    private readonly storage = new LocalCandidateStorage(),
  ) {}

  async run(input: RunInput): Promise<ProductResearchRun> {
    const limit = clampLimit(input.limit, this.config.maxResults)
    const queries = pickQueries(input).filter((item) => item.query)
    const candidates: ProductCandidate[] = []
    const errors: ProductResearchRun['errors'] = []

    for (const item of queries) {
      try {
        const products = await this.source.searchProducts({
          keywords: item.query,
          marketplace: this.config.marketplace,
          limit,
        })
        candidates.push(...products.map((product) => makeCandidate(product, {
          query: item.query,
          category: item.category,
          fixture: this.config.mode === 'fixture',
        })))
      } catch (error) {
        errors.push({
          query: item.query,
          code: 'source_error',
          message: error instanceof Error ? error.message : 'Error desconocido.',
        })
      }
    }

    const run: ProductResearchRun = {
      runId: `amazon-${new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)}`,
      createdAt: new Date().toISOString(),
      source: 'amazon',
      marketplace: this.config.marketplace,
      mode: this.config.mode,
      queries,
      candidates: rankProductCandidates(candidates, limit),
      errors,
    }

    await this.storage.saveRun(run)
    return run
  }

  async latest(): Promise<ProductResearchRun | null> {
    return await this.storage.readLatest()
  }

  async updateStatus(candidateId: string, status: 'approved' | 'rejected'): Promise<ProductCandidate> {
    return await this.storage.updateCandidateStatus(candidateId, status)
  }

  async importCandidateAsDraft(candidateId: string, supabase: SupabaseClient<Database>): Promise<ImportResult> {
    const candidate = await this.storage.findCandidate(candidateId)
    if (!candidate) {
      throw new Error('Candidato no encontrado.')
    }

    if (candidate.status === 'imported') {
      throw new Error('El candidato ya fue importado.')
    }

    validateAmazonCandidateForImport(candidate, this.config.associateTag)

    const slug = await uniqueSlug(supabase, candidate.title)
    const payload: Database['public']['Tables']['products']['Insert'] = {
      name: truncate(candidate.title, 160),
      slug,
      short_description: makeShortDescription(candidate),
      description: makeDescription(candidate),
      category: candidate.category,
      affiliate_url: candidate.affiliateUrl,
      image_url: candidate.imageUrl,
      pros: candidate.suitabilityReasons.slice(0, 6),
      cons: candidate.suitabilityWarnings.slice(0, 6),
      recommended_for: null,
      featured: false,
      published: false,
      sort_order: 0,
    }

    const result = await supabase.from('products').insert(payload).select('id, slug').single()
    if (result.error || !result.data) {
      throw new Error('No se ha podido importar el candidato como borrador.')
    }

    const updated = await this.storage.updateCandidateStatus(candidateId, 'imported')
    return {
      candidate: updated,
      productId: result.data.id,
      slug: result.data.slug,
    }
  }
}
