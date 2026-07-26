import { describe, expect, it } from 'vitest'
import { getAdminAccessResult, isAdminEmail } from '../../shared/utils/admin-auth'

describe('admin authorization helpers', () => {
  it('authorizes only the exact configured email', () => {
    expect(isAdminEmail('admin@example.com', 'admin@example.com')).toBe(true)
    expect(isAdminEmail('Admin@example.com', 'admin@example.com')).toBe(false)
  })

  it('rejects unauthenticated users and different emails', () => {
    expect(getAdminAccessResult(null, 'admin@example.com')).toBe('unauthenticated')
    expect(getAdminAccessResult('otra@example.com', 'admin@example.com')).toBe('forbidden')
  })

  it('authorizes the configured email and reports missing config', () => {
    expect(getAdminAccessResult('admin@example.com', 'admin@example.com')).toBe('authorized')
    expect(getAdminAccessResult('admin@example.com', '')).toBe('misconfigured')
  })
})
