import type { Project } from '~/types'

export default defineEventHandler(async (): Promise<Project[]> => {
  const config = useRuntimeConfig()
  const data: Project[] = await $fetch<Project[]>(`${config.public.apiBase}/api/projects`)
  return data
})