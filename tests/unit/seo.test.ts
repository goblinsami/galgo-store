import { describe, expect, it } from 'vitest'
import { createCanonicalUrl, stripMarkdown } from '../../shared/utils/seo'

describe('SEO utilities', () => {
  it('creates canonical URLs without duplicated slashes', () => {
    expect(createCanonicalUrl('https://galgostore.example/', '/productos')).toBe('https://galgostore.example/productos')
    expect(createCanonicalUrl('https://galgostore.example', 'guias/test')).toBe('https://galgostore.example/guias/test')
  })

  it('strips markdown into plain preview text', () => {
    expect(stripMarkdown('# Titulo\n\nTexto **util** para [leer](https://example.com).')).toBe('Titulo Texto util para leer https://example.com .')
  })
})
