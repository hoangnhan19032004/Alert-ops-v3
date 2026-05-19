// composables/useAuth.ts
// ─────────────────────────────────────────────────────────────
// JWT Auth hoàn chỉnh:
//   - Gọi API thực /api/auth/login, /register, /refresh, /logout
//   - Lưu accessToken trong memory (không localStorage để tránh XSS)
//   - Lưu refreshToken trong localStorage (7 ngày)
//   - Lưu user info trong localStorage để khôi phục session
//   - Auto-refresh khi accessToken sắp hết hạn
// ─────────────────────────────────────────────────────────────

import { ref, computed } from 'vue'

export interface AuthUser {
  id:    string
  name:  string
  email: string
  role:  'Admin' | 'Manager' | 'Operator' | 'Viewer'
}

// ── Singleton state (in-memory) ──────────────────────────────
const accessToken  = ref<string | null>(null)   // memory only (anti-XSS)
const currentUser  = ref<AuthUser | null>(null)
const isLoading    = ref(false)
const authError    = ref('')

// ── Storage keys ─────────────────────────────────────────────
const REFRESH_KEY = 'alertops_refresh'
const USER_KEY    = 'alertops_user'

const isClient = typeof window !== 'undefined'

// ── Helpers ──────────────────────────────────────────────────
function getApiBase(): string {
  if (import.meta.client) {
    // useRuntimeConfig() trong composable cần gọi bên ngoài setup khi SSR
    try {
      const cfg = useRuntimeConfig()
      return cfg.public.apiBase as string || 'http://localhost:5000'
    } catch {
      return 'http://localhost:5000'
    }
  }
  return 'http://localhost:5000'
}

async function apiFetch<T>(
  path: string,
  options: Parameters<typeof $fetch>[1] = {}
): Promise<T> {
  return $fetch<T>(`${getApiBase()}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> ?? {})
    }
  })
}

// Parse JWT payload để đọc expiry
function parseJwtExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp ? payload.exp * 1000 : null
  } catch {
    return null
  }
}

// ── Refresh timer ─────────────────────────────────────────────
let refreshTimer: ReturnType<typeof setTimeout> | null = null

function scheduleRefresh(token: string) {
  if (refreshTimer) clearTimeout(refreshTimer)
  const exp = parseJwtExpiry(token)
  if (!exp) return
  // Refresh 60 giây trước khi hết hạn
  const delay = exp - Date.now() - 60_000
  if (delay <= 0) {
    void silentRefresh()
    return
  }
  refreshTimer = setTimeout(() => { void silentRefresh() }, delay)
}

async function silentRefresh(): Promise<boolean> {
  if (!isClient) return false
  const rt = localStorage.getItem(REFRESH_KEY)
  if (!rt) return false

  try {
    const res = await apiFetch<{ accessToken: string; refreshToken: string; user: AuthUser }>(
      '/api/auth/refresh',
      { method: 'POST', body: { refreshToken: rt } }
    )
    accessToken.value = res.accessToken
    currentUser.value = res.user
    localStorage.setItem(REFRESH_KEY, res.refreshToken)
    localStorage.setItem(USER_KEY, JSON.stringify(res.user))
    scheduleRefresh(res.accessToken)
    return true
  } catch {
    clearAuthState()
    return false
  }
}

function clearAuthState() {
  accessToken.value  = null
  currentUser.value  = null
  authError.value    = ''
  if (refreshTimer) { clearTimeout(refreshTimer); refreshTimer = null }
  if (isClient) {
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(USER_KEY)
  }
}

// ── Composable ────────────────────────────────────────────────
export const useAuth = () => {
  const isAuthenticated = computed(() => accessToken.value !== null)

  // ── Khôi phục session khi app mount ─────────────────────────
  // Gọi 1 lần trong app.vue / layout default
  const restoreSession = async (): Promise<void> => {
    if (!isClient) return
    const savedUser = localStorage.getItem(USER_KEY)
    if (!savedUser) return

    // Thử silent refresh để lấy access token mới
    const ok = await silentRefresh()
    if (!ok) {
      // refresh token hết hạn → xóa hết
      clearAuthState()
    }
  }

  // ── Login ────────────────────────────────────────────────────
  const login = async (email: string, password: string): Promise<boolean> => {
    isLoading.value = true
    authError.value = ''

    try {
      const res = await apiFetch<{ accessToken: string; refreshToken: string; user: AuthUser }>(
        '/api/auth/login',
        { method: 'POST', body: { email, password } }
      )

      accessToken.value  = res.accessToken
      currentUser.value  = res.user

      if (isClient) {
        localStorage.setItem(REFRESH_KEY, res.refreshToken)
        localStorage.setItem(USER_KEY, JSON.stringify(res.user))
      }

      scheduleRefresh(res.accessToken)
      return true
    } catch (err: any) {
      authError.value = err?.data?.message || err?.message || 'Đăng nhập thất bại'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // ── Logout ──────────────────────────────────────────────────
  const logout = async (): Promise<void> => {
    const rt = isClient ? localStorage.getItem(REFRESH_KEY) : null
    // FIX #11: gọi API logout để xóa refresh token trên server
    if (rt && accessToken.value) {
      try {
        await apiFetch('/api/auth/logout', {
          method: 'POST',
          body: { refreshToken: rt },
          headers: { Authorization: `Bearer ${accessToken.value}` }
        })
      } catch {
        // Bỏ qua lỗi — vẫn xóa local state
      }
    }
    clearAuthState()
  }

  // ── Lấy access token hiện tại (dùng trong useApi) ───────────
  const getAccessToken = (): string | null => accessToken.value

  const clearError = () => { authError.value = '' }

  return {
    currentUser,
    isAuthenticated,
    isLoading,
    authError,
    login,
    logout,
    restoreSession,
    getAccessToken,
    clearError,
  }
}
