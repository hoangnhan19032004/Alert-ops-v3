import { ref, computed } from 'vue'
import type { NotificationHistoryItem, SendNotificationPayload } from '~/types'

export const useNotificationHistory = () => {
  const { apiCall } = useApi()
  const notificationHistory = ref<NotificationHistoryItem[]>([])
  const loading = ref(false)
  const sending = ref(false)

  // Load notifications for an alert
  const loadByAlertId = async (alertId: string) => {
    loading.value = true
    try {
      const res = await apiCall<NotificationHistoryItem[]>(
        `/api/notificationhistory/alert/${alertId}`
      )
      notificationHistory.value = Array.isArray(res) ? res : res?.data ?? []
    } catch (err) {
      console.error('Failed to load notification history:', err)
      notificationHistory.value = []
    } finally {
      loading.value = false
    }
  }

  // Send notification and record it
  const sendNotification = async (payload: SendNotificationPayload) => {
    sending.value = true
    try {
      const res = await apiCall<NotificationHistoryItem>(
        `/api/notificationhistory/send`,
        {
          method: 'POST',
          body: payload  // ✅ object trực tiếp, không stringify
        }
      )
      if (res?.data || res) {
        const newNotification = res?.data ?? res
        notificationHistory.value.unshift(newNotification as NotificationHistoryItem)
        return newNotification
      }
    } catch (err) {
      console.error('Failed to send notification:', err)
      throw err
    } finally {
      sending.value = false
    }
  }

  // Get recent notifications
  const loadRecent = async (limit = 20) => {
    loading.value = true
    try {
      const res = await apiCall<NotificationHistoryItem[]>(
        `/api/notificationhistory/recent?limit=${limit}`
      )
      return Array.isArray(res) ? res : res?.data ?? []
    } catch (err) {
      console.error('Failed to load recent notifications:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  // Get failed notifications
  const loadFailed = async () => {
    loading.value = true
    try {
      const res = await apiCall<NotificationHistoryItem[]>(
        `/api/notificationhistory/failed`
      )
      return Array.isArray(res) ? res : res?.data ?? []
    } catch (err) {
      console.error('Failed to load failed notifications:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  const sentCount   = computed(() => notificationHistory.value.filter(n => n.status === 'sent').length)
  const failedCount = computed(() => notificationHistory.value.filter(n => n.status === 'failed').length)

  return {
    notificationHistory,
    loading,
    sending,
    loadByAlertId,
    sendNotification,
    loadRecent,
    loadFailed,
    sentCount,
    failedCount
  }
}
