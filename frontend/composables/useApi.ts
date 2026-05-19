// composables/useApi.ts
// ─────────────────────────────────────────────────────────────
// FIX #7: đính Authorization: Bearer <token> vào mọi request
// FIX #8: intercept 401 → gọi refresh → retry request tự động
// ─────────────────────────────────────────────────────────────
import type { Alert, ApiResponse } from '~/types'
import { useAuth } from '~/composables/useAuth'

export const useApi = () => {
  const config  = useRuntimeConfig()
  const baseURL = (config.public.apiBase as string) || 'http://localhost:5000'
  const { getAccessToken, logout } = useAuth()

  // ── Core fetch với auto-refresh 401 ─────────────────────────
  const apiCall = async <T>(
    endpoint: string,
    options: {
      method?:  'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
      body?:    any
      headers?: Record<string, string>
    } = {},
    _retry = false          // flag để tránh vòng lặp vô hạn
  ): Promise<ApiResponse<T>> => {
    try {
      const { method = 'GET', body, headers = {} } = options

      const token = getAccessToken()

      const response = await $fetch<T>(`${baseURL}${endpoint}`, {
        method,
        body,
        headers: {
          'Content-Type': 'application/json',
          // FIX #7: đính Bearer token nếu có
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...headers
        }
      })

      return { data: response as T, success: true }
    } catch (error: any) {
      const status = error?.response?.status ?? error?.status

      // FIX #8: 401 → thử refresh rồi retry 1 lần
      if (status === 401 && !_retry) {
        const { restoreSession, getAccessToken: getNewToken } = useAuth()
        const refreshed = await restoreSession()
          .then(() => !!getNewToken())
          .catch(() => false)

        if (refreshed) {
          return apiCall<T>(endpoint, options, true)
        }
        // Refresh thất bại → logout hẳn
        await logout()
        if (import.meta.client) {
          navigateTo('/login')
        }
      }

      console.error('API Error:', error)
      return {
        data:    null as T,
        success: false,
        message: error?.data?.message || error?.message || 'API call failed'
      }
    }
  }

  // ── Shortcuts ────────────────────────────────────────────────
  const getAlerts  = () => apiCall<Alert[]>('/api/alerts')
  const createAlert = (alert: Omit<Alert, 'id'>) =>
    apiCall<Alert>('/api/alerts', { method: 'POST', body: alert })

  const healthCheck = async (): Promise<boolean> => {
    try {
      const token = getAccessToken()
      await $fetch(`${baseURL}/api/alerts`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      return true
    } catch {
      return false
    }
  }

  return { apiCall, getAlerts, createAlert, healthCheck, baseURL }
}
