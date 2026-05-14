import type { Alert } from '~/types'

export default defineEventHandler(async (event): Promise<Alert> => {
  const body = await readBody(event)
  const config = useRuntimeConfig()
  const data: Alert = await $fetch<Alert>(`${config.public.apiBase}/api/alerts`, {
    method: 'POST',
    body
  })
  return data
})