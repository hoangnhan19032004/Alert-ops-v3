import type { AlertStats } from '~/types'

export default defineEventHandler(async (): Promise<AlertStats> => {
  const config = useRuntimeConfig()
  const data = await $fetch<AlertStats>(`${config.apiBase}/api/alerts/stats`) as AlertStats
  return data
})
