import type { Alert } from '~/types'

export default defineEventHandler(async (): Promise<Alert[]> => {
  const config = useRuntimeConfig()
  const data = await $fetch<Alert[]>(`${config.apiBase}/api/alerts`) as Alert[]  
  return data
})
