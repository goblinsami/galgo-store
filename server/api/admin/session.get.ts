import { requireAdmin } from '../../utils/admin'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)

  return {
    email: admin.email,
  }
})
