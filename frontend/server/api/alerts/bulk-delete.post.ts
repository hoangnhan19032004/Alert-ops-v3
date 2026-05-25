import type { H3Event } from 'h3'

interface BulkDeleteResponse {
  deletedCount: number
}

export default defineEventHandler(
  async (
    event: H3Event
  ): Promise<BulkDeleteResponse> => {

    const body = await readBody(event)

    const config = useRuntimeConfig()

    const data =
      await $fetch<BulkDeleteResponse>(
        `${config.public.apiBase}/api/Alerts/bulk-delete`,
        {
          headers: forwardAuthHeader(event),
          method: 'POST',
          body
        }
      )

    return data
  }
)