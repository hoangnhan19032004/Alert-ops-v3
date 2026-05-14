import type { Alert } from '~/types'

export default defineEventHandler(async (event): Promise<Alert> => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const config = useRuntimeConfig()
  const data = await $fetch<Alert>(`${config.apiBase}/api/alerts/${id}/status`, {
    method: 'PATCH',
    body
  })
  return data
})
