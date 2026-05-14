import type { EscalationRule } from '~/types'

export default defineEventHandler(async (event): Promise<EscalationRule> => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const config = useRuntimeConfig()
  const data = await $fetch<EscalationRule>(`${config.apiBase}/api/escalationrules/${id}`, {
    method: 'PUT',
    body
  })
  return data
})
