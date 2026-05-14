import { defineStore } from 'pinia'
import type { Alert } from '~/types'

export const useAlertStore = defineStore('alertStore', () => {
  const alerts = ref<Alert[]>([])
  const loading = ref(false)

  async function fetchAlerts() {
    loading.value = true
    try {
      const data = await $fetch<Alert[]>('/api/alerts')
      if (data) {
        alerts.value = data
      }
    } catch (err) {
      console.error('Lỗi:', err)
      alerts.value = []
    } finally {
      loading.value = false
    }
  }

  return { alerts, loading, fetchAlerts }
})
