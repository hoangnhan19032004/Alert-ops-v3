import type { NotificationHistoryItem } from '~/types'

export default defineEventHandler(async (event): Promise<NotificationHistoryItem[]> => {
  const alertId = getRouterParam(event, 'alertId')
  const config = useRuntimeConfig()
  const data = await $fetch<NotificationHistoryItem[]>(
    `${config.apiBase}/api/notificationhistory/alert/${alertId}`
  , { headers: forwardAuthHeader(event) })
  return data
})
