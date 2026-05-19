import type { NotificationHistoryItem } from '~/types'

export default defineEventHandler(async (event): Promise<NotificationHistoryItem[]> => {
  const config = useRuntimeConfig()
  const data = await $fetch<NotificationHistoryItem[]>(
    `${config.apiBase}/api/notificationhistory/failed`
  , { headers: forwardAuthHeader(event) })
  return data
})
