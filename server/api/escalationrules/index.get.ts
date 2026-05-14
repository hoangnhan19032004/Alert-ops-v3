import type { EscalationRule } from '~/types'

export default defineEventHandler(async (): Promise<EscalationRule[]> => {
  const config = useRuntimeConfig()
  const data = await $fetch<EscalationRule[]>(`${config.apiBase}/api/escalationrules`) as EscalationRule[]
  return data
})
