// plugins/signalr.client.ts
// FIX #10: truyền accessTokenFactory để backend SignalR nhận được JWT
import { HubConnectionBuilder } from '@microsoft/signalr'
import { useAuth } from '~/composables/useAuth'

export default defineNuxtPlugin(() => {
  const config  = useRuntimeConfig()
  const baseURL = (config.public.apiBase as string) || 'http://localhost:5000'
  const { getAccessToken } = useAuth()

  const connection = new HubConnectionBuilder()
    .withUrl(`${baseURL}/hubs/alertops`, {
      // FIX: cung cấp token factory — SignalR sẽ gửi ?access_token=... khi connect
      accessTokenFactory: () => getAccessToken() ?? ''
    })
    .withAutomaticReconnect()
    .build()

  return {
    provide: {
      signalr: {
        connection,

        start: () => connection.start(),

        on: (event: string, handler: (...args: any[]) => void) => {
          connection.on(event, handler)
        },

        off: (event: string, handler?: (...args: any[]) => void) => {
          if (handler) {
            connection.off(event, handler)
          } else {
            connection.off(event)
          }
        },

        invoke: (method: string, ...args: any[]) => {
          return connection.invoke(method, ...args)
        },

        stop: () => connection.stop()
      }
    }
  }
})
