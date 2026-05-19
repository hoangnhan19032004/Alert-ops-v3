import type { Project } from '~/types'

export default defineEventHandler(async (event): Promise<Project[]> => {
  const config = useRuntimeConfig()
  const data = await $fetch<Project[]>(`${config.apiBase}/api/projects`, { headers: forwardAuthHeader(event) }) as Project[]
  return data
})
