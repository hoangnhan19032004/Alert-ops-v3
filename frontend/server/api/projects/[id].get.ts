import type { Project } from '~/types'

export default defineEventHandler(async (event): Promise<Project> => {
  const id = getRouterParam(event, 'id')
  const config = useRuntimeConfig()
  const data = await $fetch<Project>(`${config.apiBase}/api/projects/${id}`, { headers: forwardAuthHeader(event) })
  return data
})
