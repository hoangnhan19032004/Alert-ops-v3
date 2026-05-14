// composables/useApi.ts
import type { Alert, ApiResponse } from '~/types'

export const useApi = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase || 'http://localhost:5000'

  const apiCall = async <T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
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

      return { data: response as T, success: true }
    } catch (error: any) {
      console.error('API Error:', error)
      return {
        data: null as T,
        success: false,
        message: error?.data?.message || error?.message || 'API call failed'
      }
    }
  }

  const getAlerts = async (): Promise<ApiResponse<Alert[]>> => {
    return await apiCall<Alert[]>('/api/alerts')
  }

  const createAlert = async (alert: Omit<Alert, 'id'>): Promise<ApiResponse<Alert>> => {
    return await apiCall<Alert>('/api/alerts', { method: 'POST', body: alert })
  }

  const healthCheck = async (): Promise<boolean> => {
    try {
      await $fetch(`${baseURL}/api/alerts`, { method: 'GET' })
      return true
    } catch {
      return false
    }
  }

  return { apiCall, getAlerts, createAlert, healthCheck, baseURL }
}
