import type { Alert } from '~/types'

export default defineEventHandler(async (event): Promise<Alert> => {
  const id = getRouterParam(event, 'id')
  const config = useRuntimeConfig()
  const data = await $fetch<Alert>(`${config.apiBase}/api/alerts/${id}`) as Alert
  return data
})
