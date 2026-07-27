interface CompatibleBodyEvent {
  node?: {
    req?: AsyncIterable<unknown>
  }
  req?: {
    json?: () => Promise<unknown>
  }
}

export async function readEventJsonBody<T = unknown>(event: unknown): Promise<T> {
  const requestEvent = event as CompatibleBodyEvent
  if (typeof requestEvent.req?.json === 'function') {
    return await requestEvent.req.json() as T
  }

  const request = requestEvent.node?.req
  if (!request || typeof request[Symbol.asyncIterator] !== 'function') {
    throw new TypeError('El evento no contiene un body legible.')
  }

  const chunks: Buffer[] = []
  for await (const chunk of request) {
    if (typeof chunk === 'string' || chunk instanceof Uint8Array) {
      chunks.push(Buffer.from(chunk))
    } else {
      throw new TypeError('El body contiene datos no compatibles.')
    }
  }

  const body = Buffer.concat(chunks).toString('utf8')
  return JSON.parse(body) as T
}
