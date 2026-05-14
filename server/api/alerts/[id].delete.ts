export default defineEventHandler(async (event): Promise<void> => {
  const id = getRouterParam(event, 'id')
  const config = useRuntimeConfig()
  await $fetch(`${config.apiBase}/api/alerts/${id}`, { method: 'DELETE' })
})
