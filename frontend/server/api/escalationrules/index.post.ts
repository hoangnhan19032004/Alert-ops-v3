import type { EscalationRule } from '~/types'

export default defineEventHandler(async (event): Promise<EscalationRule> => {
  const body = await readBody(event)
  const config = useRuntimeConfig()
  const data = await $fetch<EscalationRule>(`${config.apiBase}/api/escalationrules`, {
    headers: forwardAuthHeader(event),
    method: 'POST',
    body
  })
  return data
})
