import type { Alert } from '~/types'

export default defineEventHandler(async (): Promise<Alert[]> => {
  const config = useRuntimeConfig()
  const data: Alert[] = await $fetch<Alert[]>(`${config.public.apiBase}/api/alerts`)
  return data
})