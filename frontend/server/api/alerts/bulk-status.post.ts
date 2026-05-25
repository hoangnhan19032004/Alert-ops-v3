import type { H3Event } from 'h3'

interface BulkStatusResponse {
  modifiedCount: number
}

export default defineEventHandler(
  async (
    event: H3Event
  ): Promise<BulkStatusResponse> => {

    const body = await readBody(event)

    const config = useRuntimeConfig()

    const data =
      await $fetch<BulkStatusResponse>(
        `${config.public.apiBase}/api/Alerts/bulk-status`,
        {
          headers: forwardAuthHeader(event),
          method: 'POST',
          body
        }
      )

    return data
  }
)