import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'

marked.setOptions({
  async: false,
  gfm: true,
  breaks: false,
})

export function renderSafeMarkdown(markdown: string): string {
  const rendered = marked.parse(markdown, { async: false }) as string

  return sanitizeHtml(rendered, {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      'h1',
      'h2',
      'h3',
      'img',
    ],
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', {
        rel: 'nofollow noopener noreferrer',
        target: '_blank',
      }),
    },
  })
}
