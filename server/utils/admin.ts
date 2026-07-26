import type { SupabaseClient } from '@supabase/supabase-js'
import type { H3Event } from 'h3'
import type { Database } from '~~/shared/types/database'
import { getAdminAccessResult } from '~~/shared/utils/admin-auth'
import { getEventHeader } from './request-header'
import { createServerSupabaseClient, createServerSupabaseServiceClient } from './supabase'

interface AdminContext {
  email: string
  supabase: SupabaseClient<Database>
}

function getBearerToken(event: H3Event): string | null {
  const authorization = getEventHeader(event, 'authorization')
  return authorization?.startsWith('Bearer ') ? authorization.slice('Bearer '.length) : null
}

function decodeBase64Url(value: string): string {
  return Buffer
    .from(value.replace(/-/g, '+').replace(/_/g, '/'), 'base64')
    .toString('utf8')
}

function readCookieMap(event: H3Event): Map<string, string> {
  const header = getEventHeader(event, 'cookie') ?? ''
  const cookies = new Map<string, string>()

  for (const part of header.split(';')) {
    const [rawName, ...rawValue] = part.trim().split('=')
    if (!rawName || rawValue.length === 0) {
      continue
    }

    cookies.set(rawName, decodeURIComponent(rawValue.join('=')))
  }

  return cookies
}

function combineCookieChunks(cookies: Map<string, string>, name: string): string | null {
  const direct = cookies.get(name)
  if (direct) {
    return direct
  }

  const chunks: string[] = []
  for (let index = 0; index < 10; index += 1) {
    const chunk = cookies.get(`${name}.${index}`)
    if (!chunk) {
      break
    }

    chunks.push(chunk)
  }

  return chunks.length ? chunks.join('') : null
}

function extractAccessTokenFromSession(value: unknown): string | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const token = (value as { access_token?: unknown }).access_token
    if (typeof token === 'string') {
      return token
    }
  }

  if (Array.isArray(value)) {
    const [token] = value
    return typeof token === 'string' ? token : null
  }

  return null
}

function getCookieAccessToken(event: H3Event): string | null {
  const cookies = readCookieMap(event)
  const sessionCookieName = [...cookies.keys()].find((name) => name.startsWith('sb-') && name.endsWith('-auth-token'))

  if (!sessionCookieName) {
    return null
  }

  const encodedSession = combineCookieChunks(cookies, sessionCookieName)
  if (!encodedSession) {
    return null
  }

  const sessionJson = encodedSession.startsWith('base64-')
    ? decodeBase64Url(encodedSession.slice('base64-'.length))
    : encodedSession

  try {
    return extractAccessTokenFromSession(JSON.parse(sessionJson))
  } catch {
    return null
  }
}

export async function requireAdmin(event: H3Event): Promise<AdminContext> {
  const config = useRuntimeConfig(event)
  const configuredEmail = String(config.adminEmail || '')

  const sessionClient = createServerSupabaseClient()
  const accessToken = getBearerToken(event) ?? getCookieAccessToken(event)
  const userResult = sessionClient && accessToken
    ? await sessionClient.auth.getUser(accessToken).catch(() => null)
    : null
  const email = userResult?.data.user?.email ?? null
  const access = getAdminAccessResult(email, configuredEmail)

  if (access === 'misconfigured') {
    throw createError({
      statusCode: 500,
      statusMessage: 'Administrador no configurado.',
    })
  }

  if (access === 'unauthenticated') {
    throw createError({
      statusCode: 401,
      statusMessage: 'Sesion requerida.',
    })
  }

  if (access === 'forbidden') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Acceso no autorizado.',
    })
  }

  const supabase = createServerSupabaseServiceClient()
  if (!supabase) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Supabase administrativo no esta configurado.',
    })
  }

  return {
    email: email ?? '',
    supabase,
  }
}
