import { onMounted, onUnmounted, readonly } from 'vue'

interface NotificationAlert {
  id: string
  message: string
  severity: string
  service: string
}

type NotificationType = 'alerts' | 'projects' | 'escalation' | 'analytics'

export const useNotifications = () => {
  const { apiCall } = useApi()
  const { $signalr } = useNuxtApp() as unknown as {
    $signalr: {
      start: () => Promise<void>
      on: (event: string, handler: (...args: any[]) => void) => void
    }
  }

  // ================= STATE =================

  const enabled = useState('notifications-enabled', () => true)

  const counters = useState('notification-counters', () => ({
    alerts: 0,
    projects: 0,
    escalation: 0,
    analytics: 0
  }))

  const lastKnownCount = useState('last-known-count', () => -1)
  const newAlertCount  = useState('new-alert-count', () => 0)
  const newAlerts      = useState<NotificationAlert[]>('new-alerts', () => [])

  let pollTimer: ReturnType<typeof setInterval> | null = null

  // ================= HELPER =================

  const increaseCounter = (type: NotificationType, count = 1) => {
    counters.value[type] += count
  }

  const resetCounter = (type: NotificationType) => {
    counters.value[type] = 0
  }

  // ================= POLLING =================

  const checkForNew = async () => {
    if (!enabled.value) return

    try {
      const response = await apiCall<any>('/api/alerts/stats')
      if (!response?.success || !response?.data) return

      const currentTotal: number = response.data.total ?? 0

      if (lastKnownCount.value === -1) {
        lastKnownCount.value = currentTotal
        return
      }

      if (currentTotal > lastKnownCount.value) {
        const diff = currentTotal - lastKnownCount.value

        newAlertCount.value = diff
        lastKnownCount.value = currentTotal

        // 🔴 update badge
        increaseCounter('alerts', diff)

        // lấy alert mới
        const alertsResp = await apiCall<any[]>('/api/alerts')

        if (alertsResp?.success && alertsResp?.data) {
          newAlerts.value = (alertsResp.data ?? [])
            .slice(0, diff)
            .map(a => ({
              id: a?.id ?? a?._id ?? 'unknown',
              message: a?.message ?? '',
              severity: a?.severity ?? '',
              service: a?.service ?? ''
            }))
        }

        // 🔔 browser notification
        if (
          typeof window !== 'undefined' &&
          'Notification' in window &&
          Notification.permission === 'granted'
        ) {
          new Notification(`🚨 ${diff} new alert${diff > 1 ? 's' : ''}`, {
            body: newAlerts.value[0]?.message ?? '',
            icon: '/favicon.ico'
          })
        }
      }
    } catch (err) {
      console.warn('Polling failed:', err)
    }
  }

  const startPolling = (intervalMs = 30000) => {
    if (pollTimer) return
    pollTimer = setInterval(checkForNew, intervalMs)
    checkForNew()
  }

  const stopPolling = () => {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  // ================= SIGNALR =================

  const initSignalR = async () => {
    try {
      await $signalr.start()

      console.log('✅ SignalR connected')

      $signalr.on('ReceiveNotification', (data: { type: NotificationType; count: number }) => {
        console.log('📩 Realtime:', data)

        // 🔴 FIX: dùng function thay vì mutate trực tiếp
        increaseCounter(data.type, data.count)

        // 🔔 browser notification
        if (
          typeof window !== 'undefined' &&
          'Notification' in window &&
          Notification.permission === 'granted'
        ) {
          new Notification(`🔔 New ${data.type}`, {
            body: `You have ${data.count} new ${data.type}`,
            icon: '/favicon.ico'
          })
        }
      })
    } catch (err) {
      console.warn('SignalR failed:', err)
    }
  }

  // ================= PERMISSION =================

  const requestPermission = async () => {
    if (typeof window === 'undefined') return

    if ('Notification' in window && Notification.permission !== 'granted') {
      await Notification.requestPermission()
    }
  }

  // ================= ACTION =================

  const dismissNewAlerts = () => {
    newAlertCount.value = 0
    newAlerts.value = []
  }

  const toggleEnabled = () => {
    enabled.value = !enabled.value
  }

  // ================= INIT =================

  if (typeof window !== 'undefined') {
    onMounted(async () => {
      startPolling()
      // await initSignalR() // Temporarily disabled
    })

    onUnmounted(() => {
      stopPolling()
    })
  }

  // ================= EXPORT =================

  return {
    enabled: readonly(enabled),

    counters: readonly(counters),
    newAlertCount: readonly(newAlertCount),
    newAlerts: readonly(newAlerts),

    increaseCounter,
    resetCounter,

    startPolling,
    stopPolling,
    requestPermission,
    dismissNewAlerts,
    toggleEnabled
  }
}