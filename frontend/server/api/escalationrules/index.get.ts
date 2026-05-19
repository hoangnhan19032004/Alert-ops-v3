import type { EscalationRule } from '~/types'

export default defineEventHandler(async (event): Promise<EscalationRule[]> => {
  const config = useRuntimeConfig()
  const data = await $fetch<EscalationRule[]>(`${config.apiBase}/api/escalationrules`, { headers: forwardAuthHeader(event) }) as EscalationRule[]
  return data
})
