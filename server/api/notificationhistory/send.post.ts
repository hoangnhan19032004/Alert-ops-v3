import type { NotificationHistoryItem, SendNotificationPayload } from '~/types'

export default defineEventHandler(async (event): Promise<NotificationHistoryItem> => {
  const body = await readBody<SendNotificationPayload>(event)
  const config = useRuntimeConfig()
  const data = await $fetch<NotificationHistoryItem>(
    `${config.apiBase}/api/notificationhistory/send`,
    { method: 'POST', body }
  )
  return data
})
