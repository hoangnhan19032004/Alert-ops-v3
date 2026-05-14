import type { NotificationHistoryItem } from '~/types'

export default defineEventHandler(async (event): Promise<NotificationHistoryItem[]> => {
  const query = getQuery(event)
  const limit = query.limit ?? 20
  const config = useRuntimeConfig()
  const data = await $fetch<NotificationHistoryItem[]>(
    `${config.apiBase}/api/notificationhistory/recent?limit=${limit}`
  )
  return data
})
