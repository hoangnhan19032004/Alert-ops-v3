import type { NotificationHistoryItem } from '~/types'

export default defineEventHandler(async (): Promise<NotificationHistoryItem[]> => {
  const config = useRuntimeConfig()
  const data = await $fetch<NotificationHistoryItem[]>(
    `${config.apiBase}/api/notificationhistory/failed`
  )
  return data
})
