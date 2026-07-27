import { Readable } from 'node:stream'
import { describe, expect, it } from 'vitest'
import { readEventJsonBody } from '../../server/utils/request-body'

describe('server request body compatibility', () => {
  it('reads JSON from Nitro Node request streams', async () => {
    const event = {
      node: {
        req: Readable.from([
          '{"name":"Arnes',
          ' seguro","published":true}',
        ]),
      },
    }

    await expect(readEventJsonBody(event)).resolves.toEqual({
      name: 'Arnes seguro',
      published: true,
    })
  })

  it('supports web standard Request bodies', async () => {
    const request = new Request('http://localhost/api/test', {
      method: 'POST',
      body: JSON.stringify({ name: 'Collar' }),
      headers: { 'content-type': 'application/json' },
    })

    await expect(readEventJsonBody({ req: request })).resolves.toEqual({
      name: 'Collar',
    })
  })
})
