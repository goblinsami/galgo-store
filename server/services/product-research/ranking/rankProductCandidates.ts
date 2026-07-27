import type { ProductCategory } from '../../../../shared/types/database'
import type { ProductCandidate, ProductEvidence, SourceProduct } from '../../../../shared/types/product-research'

const SIGHTHOUND_TERMS = ['galgo', 'galgos', 'greyhound', 'whippet', 'sighthound', 'lebrel', 'lebreles']
const MEASURE_TERMS = ['talla', 'medida', 'cuello', 'pecho', 'lomo', 'cintura', 'cm', 'ajustable']
const ESCAPE_TERMS = ['antiescape', 'anti escape', 'tres puntos', '3 puntos', 'martingale']
const MATERIAL_TERMS = ['impermeable', 'polar', 'softshell', 'algodon', 'nylon', 'neopreno', 'acolchado']
const SLENDER_TERMS = ['estrecho', 'delgado', 'largo', 'profundo', 'cuerpo fino']

export const INITIAL_SIGHTHOUND_SEARCHES: Array<{ query: string, category: ProductCategory }> = [
  { query: 'collar martingale galgo', category: 'collares' },
  { query: 'arnes antiescape galgo', category: 'arneses' },
  { query: 'abrigo galgo', category: 'abrigos' },
  { query: 'impermeable galgo', category: 'abrigos' },
  { query: 'cama para galgo', category: 'camas' },
  { query: 'bozal galgo', category: 'otros' },
  { query: 'collar greyhound', category: 'collares' },
  { query: 'whippet coat', category: 'abrigos' },
  { query: 'sighthound harness', category: 'arneses' },
  { query: 'italian greyhound clothes', category: 'abrigos' },
]

function includesAny(haystack: string, terms: string[]): boolean {
  return terms.some((term) => haystack.includes(term))
}

function evidenceFor(product: SourceProduct, terms: string[], field: string): ProductEvidence[] {
  return product.evidence.filter((item) => terms.some((term) => item.value.toLowerCase().includes(term)))
    .map((item) => ({ ...item, field }))
}

export function evaluateSighthoundSuitability(product: SourceProduct) {
  const haystack = product.rawFacts.join(' ').toLowerCase()
  const reasons: string[] = []
  const warnings: string[] = []
  const evidence: ProductEvidence[] = []
  let score = 0

  if (includesAny(haystack, SIGHTHOUND_TERMS)) {
    score += 35
    reasons.push('La ficha menciona galgos, greyhounds, whippets, sighthounds o lebreles.')
    evidence.push(...evidenceFor(product, SIGHTHOUND_TERMS, 'sighthound_term'))
  }

  if (includesAny(haystack, MEASURE_TERMS)) {
    score += 20
    reasons.push('Incluye pistas de tallaje o medidas que permiten revision manual.')
    evidence.push(...evidenceFor(product, MEASURE_TERMS, 'measure_term'))
  } else {
    warnings.push('No se han encontrado medidas suficientes en la respuesta.')
  }

  if (includesAny(haystack, ESCAPE_TERMS)) {
    score += 18
    reasons.push('Menciona sistema antiescape, tres puntos o martingale.')
    evidence.push(...evidenceFor(product, ESCAPE_TERMS, 'escape_term'))
  }

  if (includesAny(haystack, MATERIAL_TERMS)) {
    score += 14
    reasons.push('Describe materiales o proteccion frente al clima.')
    evidence.push(...evidenceFor(product, MATERIAL_TERMS, 'material_term'))
  }

  if (includesAny(haystack, SLENDER_TERMS)) {
    score += 13
    reasons.push('Aporta indicios de patron para cuerpos delgados o largos.')
    evidence.push(...evidenceFor(product, SLENDER_TERMS, 'slender_body_term'))
  }

  if (!reasons.length || score < 45) {
    warnings.push('La adecuacion para galgos no puede afirmarse sin revision humana.')
  }

  return {
    suitabilityScore: Math.min(score, 100),
    suitabilityReasons: reasons,
    suitabilityWarnings: warnings,
    suitabilityEvidence: evidence,
    suitabilityStatus: score >= 45 ? 'promising' as const : 'manual_review_required' as const,
  }
}

function queryScore(product: ProductCandidate): number {
  const terms = product.query.toLowerCase().split(/\s+/).filter((term) => term.length > 2)
  if (!terms.length) {
    return 0
  }

  const haystack = [product.title, product.brand, product.amazonCategory, ...product.features].filter(Boolean).join(' ').toLowerCase()
  const matched = terms.filter((term) => haystack.includes(term)).length
  return (matched / terms.length) * 100
}

function informationScore(product: ProductCandidate): number {
  const fields = [
    product.title,
    product.brand,
    product.amazonCategory,
    product.features.length ? 'features' : '',
    product.price.amount !== null ? 'price' : '',
    product.availability,
    product.customerRating !== null ? 'rating' : '',
    product.reviewCount !== null ? 'reviews' : '',
  ].filter(Boolean)

  return Math.min((fields.length / 8) * 100, 100)
}

function ratingScore(product: ProductCandidate): number {
  if (product.customerRating === null || product.reviewCount === null) {
    return 0
  }

  const rating = (product.customerRating / 5) * 70
  const reviews = Math.min(Math.log10(product.reviewCount + 1) / 4, 1) * 30
  return rating + reviews
}

function availabilityScore(product: ProductCandidate): number {
  let score = 0
  if (product.availability) {
    score += 45
  }

  if (product.price.amount !== null && product.price.currency === 'EUR') {
    score += 55
  }

  return score
}

function imageScore(product: ProductCandidate): number {
  let score = product.imageUrl ? 60 : 0
  score += Math.min(product.images.length * 10, 40)
  return Math.min(score, 100)
}

function brandModelKey(product: ProductCandidate): string | null {
  const brand = product.brand?.toLowerCase().replace(/[^a-z0-9]+/g, '')
  const words = product.title.toLowerCase().replace(/[^a-z0-9 ]+/g, '').split(/\s+/).slice(0, 8).join('-')
  return brand && words ? `${brand}:${words}` : null
}

export function makeCandidate(product: SourceProduct, input: {
  query: string
  category: ProductCategory
  fixture: boolean
}): ProductCandidate {
  const suitability = evaluateSighthoundSuitability(product)

  return {
    ...product,
    id: `amazon-${product.asin.toLowerCase()}`,
    query: input.query,
    category: input.category,
    fixture: input.fixture,
    totalScore: 0,
    status: 'candidate',
    ...suitability,
  }
}

export function rankProductCandidates(candidates: ProductCandidate[], limit = 10): ProductCandidate[] {
  const seenAsin = new Set<string>()
  const seenParent = new Set<string>()
  const seenBrandModel = new Set<string>()
  const seenUrl = new Set<string>()
  const unique: ProductCandidate[] = []

  for (const candidate of candidates) {
    const brandKey = brandModelKey(candidate)
    if (
      seenAsin.has(candidate.asin)
      || (candidate.parentAsin && seenParent.has(candidate.parentAsin))
      || (brandKey && seenBrandModel.has(brandKey))
      || seenUrl.has(candidate.sourceUrl)
    ) {
      continue
    }

    seenAsin.add(candidate.asin)
    if (candidate.parentAsin) {
      seenParent.add(candidate.parentAsin)
    }
    if (brandKey) {
      seenBrandModel.add(brandKey)
    }
    seenUrl.add(candidate.sourceUrl)
    unique.push(candidate)
  }

  return unique
    .map((candidate) => ({
      ...candidate,
      totalScore: Math.round((
        candidate.suitabilityScore * 0.4
        + queryScore(candidate) * 0.2
        + informationScore(candidate) * 0.15
        + ratingScore(candidate) * 0.1
        + availabilityScore(candidate) * 0.1
        + imageScore(candidate) * 0.05
      ) * 10) / 10,
    }))
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, Math.min(limit, 10))
}
