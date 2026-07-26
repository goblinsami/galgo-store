import { createCanonicalUrl } from '~~/shared/utils/seo'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  setHeader(event, 'content-type', 'text/plain; charset=utf-8')

  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin/',
    `Sitemap: ${createCanonicalUrl(String(config.public.siteUrl), '/sitemap.xml')}`,
  ].join('\n')
})
