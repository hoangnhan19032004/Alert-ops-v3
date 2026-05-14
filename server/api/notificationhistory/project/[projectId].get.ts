import type { NotificationHistoryItem } from '~/types'

export default defineEventHandler(async (event): Promise<NotificationHistoryItem[]> => {
  const projectId = getRouterParam(event, 'projectId')
  const config = useRuntimeConfig()
  const data = await $fetch<NotificationHistoryItem[]>(
    `${config.apiBase}/api/notificationhistory/project/${projectId}`
  )
  return data
})
