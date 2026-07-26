import type { ProductCategory } from '../types/database'

export const PRODUCT_CATEGORIES = [
  'arneses',
  'collares',
  'abrigos',
  'camas',
  'alimentacion',
  'viajes',
  'higiene',
  'otros',
] as const satisfies readonly ProductCategory[]

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  arneses: 'Arneses',
  collares: 'Collares',
  abrigos: 'Abrigos',
  camas: 'Camas',
  alimentacion: 'Alimentacion',
  viajes: 'Viajes',
  higiene: 'Higiene',
  otros: 'Otros',
}

export function isProductCategory(value: string | null | undefined): value is ProductCategory {
  return typeof value === 'string' && PRODUCT_CATEGORIES.includes(value as ProductCategory)
}

export function normalizeCategory(value: string | (string | null)[] | null | undefined): ProductCategory | undefined {
  const candidate = Array.isArray(value) ? value[0] : value
  return isProductCategory(candidate) ? candidate : undefined
}
