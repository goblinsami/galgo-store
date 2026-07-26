import { describe, expect, it } from 'vitest'
import { getEventHeader } from '../../server/utils/request-header'

describe('server request header compatibility', () => {
  it('reads headers from Nitro Node events', () => {
    const event = {
      node: {
        req: {
          headers: {
            authorization: 'Bearer node-token',
            cookie: ['first=1', 'second=2'],
          },
        },
      },
    }

    expect(getEventHeader(event, 'Authorization')).toBe('Bearer node-token')
    expect(getEventHeader(event, 'cookie')).toBe('first=1; second=2')
  })

  it('reads plain request header objects without calling Headers.get', () => {
    const event = {
      req: {
        headers: {
          authorization: 'Bearer object-token',
        },
      },
    }

    expect(getEventHeader(event, 'authorization')).toBe('Bearer object-token')
  })

  it('supports web standard Headers objects', () => {
    const event = {
      req: {
        headers: new Headers({
          authorization: 'Bearer web-token',
        }),
      },
    }

    expect(getEventHeader(event, 'authorization')).toBe('Bearer web-token')
  })
})
