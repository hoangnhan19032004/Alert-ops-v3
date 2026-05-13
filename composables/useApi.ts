// composables/useApi.ts

interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

// 🔥 đổi tên cho đúng bản chất backend
interface Alert {
  id?: string
  message: string
  service: string
  severity: string
  time?: string
  status?: string
}

export const useApi = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase || 'http://localhost:5000'

  const apiCall = async <T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
      body?: any
      headers?: Record<string, string>
    } = {}
  ): Promise<ApiResponse<T>> => {
    try {
      const { method = 'GET', body, headers = {} } = options

      const response = await $fetch<T>(`${baseURL}${endpoint}`, {
        method,
        body,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      })

      return {
        data: response,
        success: true
      }
    } catch (error: any) {
      console.error('API Error:', error)

      return {
        data: null as T,
        success: false,
        message: error?.data?.message || error?.message || 'API call failed'
      }
    }
  }

  // ✅ ALERTS API (thay cho errors)
  const getAlerts = async (): Promise<ApiResponse<Alert[]>> => {
    return await apiCall<Alert[]>('/api/alerts')
  }

  const createAlert = async (alert: Omit<Alert, 'id'>): Promise<ApiResponse<Alert>> => {
    return await apiCall<Alert>('/api/alerts', {
      method: 'POST',
      body: alert
    })
  }

  // ✅ Health check (sửa lại luôn)
  const healthCheck = async (): Promise<boolean> => {
    try {
      await $fetch(`${baseURL}/api/alerts`, { method: 'GET' })
      return true
    } catch {
      return false
    }
  }

  return {
    apiCall,

    // 🔥 dùng alerts thay vì errors
    getAlerts,
    createAlert,

    healthCheck,
    baseURL
  }
}