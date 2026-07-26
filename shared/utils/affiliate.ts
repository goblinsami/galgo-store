const ALLOWED_AMAZON_SPAIN_HOSTNAMES = new Set([
  'amazon.es',
  'www.amazon.es',
])

export function isAllowedAmazonSpainUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && ALLOWED_AMAZON_SPAIN_HOSTNAMES.has(url.hostname.toLowerCase())
  } catch {
    return false
  }
}

export function getAllowedAmazonSpainDomains(): string[] {
  return [...ALLOWED_AMAZON_SPAIN_HOSTNAMES]
}
