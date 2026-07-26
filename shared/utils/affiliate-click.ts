import { z } from 'zod'
import type { AffiliateClickPayload } from '../types/database'

const optionalTrackingValue = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(/^[a-zA-Z0-9._~:/?#[\]@!$&'()*+,;=%-]+$/)
  .optional()

export const affiliateClickPayloadSchema = z.object({
  productId: z.uuid(),
  sourcePage: z.string().trim().startsWith('/').max(240).optional(),
  utmSource: optionalTrackingValue,
  utmMedium: optionalTrackingValue,
  utmCampaign: optionalTrackingValue,
  utmContent: optionalTrackingValue,
})

export function parseAffiliateClickPayload(payload: unknown): AffiliateClickPayload {
  return affiliateClickPayloadSchema.parse(payload)
}
