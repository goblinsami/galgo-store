import { describe, expect, it } from 'vitest'
import { isProductCategory, normalizeCategory } from '../../shared/utils/categories'

describe('product categories', () => {
  it('accepts only declared product categories', () => {
    expect(isProductCategory('arneses')).toBe(true)
    expect(isProductCategory('camas')).toBe(true)
    expect(isProductCategory('juguetes')).toBe(false)
    expect(isProductCategory('')).toBe(false)
  })

  it('normalizes route query values safely', () => {
    expect(normalizeCategory('abrigos')).toBe('abrigos')
    expect(normalizeCategory(['collares', 'arneses'])).toBe('collares')
    expect(normalizeCategory('invalid')).toBeUndefined()
    expect(normalizeCategory(undefined)).toBeUndefined()
  })
})
