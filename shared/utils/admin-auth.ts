export function getConfiguredAdminEmail(value: string | null | undefined): string | null {
  const email = value?.trim()
  return email ? email : null
}

export function isAdminEmail(userEmail: string | null | undefined, configuredEmail: string | null | undefined): boolean {
  const adminEmail = getConfiguredAdminEmail(configuredEmail)
  return Boolean(adminEmail && userEmail === adminEmail)
}

export type AdminAccessResult = 'authorized' | 'unauthenticated' | 'forbidden' | 'misconfigured'

export function getAdminAccessResult(
  userEmail: string | null | undefined,
  configuredEmail: string | null | undefined,
): AdminAccessResult {
  const adminEmail = getConfiguredAdminEmail(configuredEmail)

  if (!adminEmail) {
    return 'misconfigured'
  }

  if (!userEmail) {
    return 'unauthenticated'
  }

  return userEmail === adminEmail ? 'authorized' : 'forbidden'
}
