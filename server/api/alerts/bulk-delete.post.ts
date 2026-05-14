export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()
  const data = await $fetch(`${config.apiBase}/api/alerts/bulk-delete`, {
    method: 'POST',
    body
  })
  return data
})
