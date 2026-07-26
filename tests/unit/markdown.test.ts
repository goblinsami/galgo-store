import { describe, expect, it } from 'vitest'
import { renderSafeMarkdown } from '../../shared/utils/markdown'

describe('safe markdown rendering', () => {
  it('removes unsafe HTML while preserving Markdown structure', () => {
    const html = renderSafeMarkdown('# Guia\n\n<script>alert("x")</script>\n\n[Amazon](https://www.amazon.es/dp/ASIN)')

    expect(html).toContain('<h1>Guia</h1>')
    expect(html).not.toContain('<script>')
    expect(html).toContain('rel="nofollow noopener noreferrer"')
  })
})
