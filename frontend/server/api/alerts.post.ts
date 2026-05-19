import type { Alert } from '~/types'

export default defineEventHandler(async (event): Promise<Alert> => {
  const body = await readBody(event)
  const config = useRuntimeConfig()
  const data = await $fetch<Alert>(`${config.apiBase}/api/alerts`, {
    headers: forwardAuthHeader(event),
    method: 'POST',
    body
  })
  return data
})
