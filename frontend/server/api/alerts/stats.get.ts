import type { AlertStats } from '~/types'

export default defineEventHandler(async (event): Promise<AlertStats> => {
  const config = useRuntimeConfig()
  const data = await $fetch<AlertStats>(`${config.apiBase}/api/alerts/stats`, { headers: forwardAuthHeader(event) }) as AlertStats
  return data
})
