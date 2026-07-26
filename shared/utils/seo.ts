export function createCanonicalUrl(siteUrl: string, path: string): string {
  const base = siteUrl.trim() || 'http://localhost:3000'
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${normalizedBase}${normalizedPath}`
}

export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#*_>`[\]()-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
