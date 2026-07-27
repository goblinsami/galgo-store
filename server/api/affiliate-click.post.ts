import { parseAffiliateClickPayload } from '~~/shared/utils/affiliate-click'
import { isAllowedAmazonSpainUrl } from '~~/shared/utils/affiliate'
import { readEventJsonBody } from '../utils/request-body'
import { getEventHeader } from '../utils/request-header'
import { createServerSupabaseClient } from '../utils/supabase'

export default defineEventHandler(async (event) => {
  const supabase = createServerSupabaseClient()

  if (!supabase) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Supabase no esta configurado.',
    })
  }

  const body = await readEventJsonBody(event)
  const payload = parseAffiliateClickPayload(body)

  const { data: product, error } = await supabase
    .from('products')
    .select('id, affiliate_url, published')
    .eq('id', payload.productId)
    .eq('published', true)
    .maybeSingle()

  if (error || !product) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Producto no encontrado.',
    })
  }

  if (!isAllowedAmazonSpainUrl(product.affiliate_url)) {
    throw createError({
      statusCode: 500,
      statusMessage: 'URL afiliada no permitida.',
    })
  }

  const referrer = getEventHeader(event, 'referer') ?? null
  const insertResult = await supabase
    .from('affiliate_clicks')
    .insert({
      product_id: product.id,
      source_page: payload.sourcePage ?? null,
      utm_source: payload.utmSource ?? null,
      utm_medium: payload.utmMedium ?? null,
      utm_campaign: payload.utmCampaign ?? null,
      utm_content: payload.utmContent ?? null,
      referrer,
    })

  if (insertResult.error) {
    console.warn('affiliate_click_insert_failed')
  }

  return {
    affiliateUrl: product.affiliate_url,
    tracked: !insertResult.error,
  }
})
