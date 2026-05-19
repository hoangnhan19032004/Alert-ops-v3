// server/utils/authHeader.ts
// Forward Authorization header từ browser request lên backend ASP.NET
// Dùng trong tất cả server/api proxy routes

import type { H3Event } from 'h3'

/**
 * Lấy Authorization header từ request của client và trả về object headers
 * để đính vào $fetch khi gọi lên backend.
 *
 * Usage:
 *   const headers = forwardAuthHeader(event)
 *   await $fetch('/api/alerts', { headers })
 */
export function forwardAuthHeader(event: H3Event): Record<string, string> {
  const auth = getHeader(event, 'authorization')
  return auth ? { authorization: auth } : {}
}
