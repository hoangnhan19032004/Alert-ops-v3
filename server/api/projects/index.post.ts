import type { Project } from '~/types'

export default defineEventHandler(async (event): Promise<Project> => {
  const body = await readBody(event)
  const config = useRuntimeConfig()
  const data = await $fetch<Project>(`${config.apiBase}/api/projects`, {
    method: 'POST',
    body
  })
  return data
})
