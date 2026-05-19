import type { Alert } from '~/types'

export default defineEventHandler(async (event): Promise<Alert[]> => {
  const config = useRuntimeConfig()
  const data = await $fetch<Alert[]>(`${config.apiBase}/api/alerts`, { headers: forwardAuthHeader(event) }) as Alert[]  
  return data
})
