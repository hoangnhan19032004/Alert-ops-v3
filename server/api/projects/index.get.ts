import type { Project } from '~/types'

export default defineEventHandler(async (): Promise<Project[]> => {
  const config = useRuntimeConfig()
  const data = await $fetch<Project[]>(`${config.apiBase}/api/projects`)
  return data
})
