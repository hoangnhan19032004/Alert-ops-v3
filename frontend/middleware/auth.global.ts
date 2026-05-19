// middleware/auth.global.ts
// ─────────────────────────────────────────────────────────────
// FIX #9: SSR-safe route guard
//   - Không dùng localStorage (không tồn tại phía server)
//   - Dùng useCookie để đọc được cả client lẫn server
//   - accessToken lưu trong memory (useAuth), refresh token trong cookie
//   - Trên server: check cookie 'alertops_session' (set khi login)
// ─────────────────────────────────────────────────────────────

export default defineNuxtRouteMiddleware(async (to) => {
  const publicPages = ['/login', '/logout']
  if (publicPages.includes(to.path)) return

  // Dùng cookie để check session (đọc được cả SSR lẫn CSR)
  const sessionCookie = useCookie('alertops_session')

  // Client: thêm kiểm tra memory state từ useAuth
  if (import.meta.client) {
    const { isAuthenticated, restoreSession, getAccessToken } = useAuth()

    // Nếu chưa có access token trong memory, thử restore
    if (!isAuthenticated.value) {
      await restoreSession()
    }

    // Sau restore, nếu vẫn chưa auth → về login
    if (!isAuthenticated.value && !sessionCookie.value) {
      return navigateTo('/login')
    }
    return
  }

  // Server-side: chỉ có thể check cookie
  if (!sessionCookie.value) {
    return navigateTo('/login')
  }
})
