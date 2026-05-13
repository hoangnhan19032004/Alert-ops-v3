// plugins/signalr.client.ts
import { HubConnectionBuilder } from '@microsoft/signalr'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase || 'http://localhost:5000'

  const connection = new HubConnectionBuilder()
    .withUrl(`${baseURL}/hubs/alertops`)
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

        // ✅ FIX Ở ĐÂY
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