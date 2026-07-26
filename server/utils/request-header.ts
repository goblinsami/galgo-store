type HeaderValue = string | string[] | undefined

interface CompatibleRequestEvent {
  node?: {
    req?: {
      headers?: Record<string, HeaderValue>
    }
  }
  req?: {
    headers?: Headers | Record<string, HeaderValue>
  }
}

function normalizeHeaderValue(value: HeaderValue, name: string): string | undefined {
  if (Array.isArray(value)) {
    return value.join(name === 'cookie' ? '; ' : ', ')
  }

  return value
}

export function getEventHeader(event: unknown, name: string): string | undefined {
  const requestEvent = event as CompatibleRequestEvent
  const normalizedName = name.toLowerCase()
  const nodeValue = requestEvent.node?.req?.headers?.[normalizedName]

  if (nodeValue !== undefined) {
    return normalizeHeaderValue(nodeValue, normalizedName)
  }

  const headers = requestEvent.req?.headers
  if (!headers) {
    return undefined
  }

  if (typeof (headers as Headers).get === 'function') {
    return (headers as Headers).get(normalizedName) ?? undefined
  }

  return normalizeHeaderValue(
    (headers as Record<string, HeaderValue>)[normalizedName],
    normalizedName,
  )
}
