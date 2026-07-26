<template>
  <button class="button" type="button" :disabled="pending" @click="openAffiliateLink">
    {{ pending ? 'Abriendo...' : 'Ver producto en Amazon' }}
  </button>
</template>

<script setup lang="ts">
import type { AffiliateClickPayload } from '~~/shared/types/database'
import { isAllowedAmazonSpainUrl } from '~~/shared/utils/affiliate'

const props = defineProps<{
  productId: string
  affiliateUrl: string
  sourcePage: string
}>()

const pending = ref(false)
const route = useRoute()

async function openAffiliateLink() {
  if (pending.value || !isAllowedAmazonSpainUrl(props.affiliateUrl)) {
    return
  }

  pending.value = true
  const targetWindow = window.open('about:blank', '_blank', 'noopener,noreferrer')

  const payload: AffiliateClickPayload = {
    productId: props.productId,
    sourcePage: props.sourcePage,
    utmSource: typeof route.query.utm_source === 'string' ? route.query.utm_source : undefined,
    utmMedium: typeof route.query.utm_medium === 'string' ? route.query.utm_medium : undefined,
    utmCampaign: typeof route.query.utm_campaign === 'string' ? route.query.utm_campaign : undefined,
    utmContent: typeof route.query.utm_content === 'string' ? route.query.utm_content : undefined,
  }

  try {
    const response = await $fetch<{ affiliateUrl: string }>('/api/affiliate-click', {
      method: 'POST',
      body: payload,
    })
    const url = isAllowedAmazonSpainUrl(response.affiliateUrl) ? response.affiliateUrl : props.affiliateUrl
    navigateOpenedWindow(targetWindow, url)
  } catch {
    navigateOpenedWindow(targetWindow, props.affiliateUrl)
  } finally {
    pending.value = false
  }
}

function navigateOpenedWindow(targetWindow: Window | null, url: string) {
  if (targetWindow) {
    targetWindow.location.href = url
    return
  }

  window.open(url, '_blank', 'noopener,noreferrer')
}
</script>
