import * as signalR from '@microsoft/signalr'

// useAlertsRealtime.ts - This composable is used to receive real-time alerts from the backend
export const useAlertsRealtime = () => {
  const config = useRuntimeConfig()

  let connection: signalR.HubConnection | null = null

  const start = async (
    onNewAlert: (alert: any) => void,
    onUpdatedAlert: (alert: any) => void,
    onDeletedAlert: (id: string) => void
  ) => {
    if (connection) return

    connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5000/hubs/alertops')
      .withAutomaticReconnect()
      .build()

    // ALERT CREATED - Tạo cảnh báo mới
    connection.on('alert:new', (alert) => {
      console.log('Realtime new alert', alert)
      onNewAlert(alert)
    })

    // ALERT UPDATED - Cập nhật cảnh báo
    connection.on('alert:updated', (alert) => {
      console.log('Realtime updated alert', alert)
      onUpdatedAlert(alert)
    })

    // ALERT DELETED - Xóa cảnh báo
    connection.on('alert:deleted', (id) => {
      console.log('Realtime deleted alert', id)
      onDeletedAlert(id)
    })

    try {
      await connection.start()

      console.log('✅ SignalR Connected')
    }
    catch (err) {
      console.error('❌ SignalR Error', err)
    }
  }

  const stop = async () => {
    if (connection) {
      await connection.stop()
      connection = null
    }
  }

  return {
    start,
    stop
  }
}