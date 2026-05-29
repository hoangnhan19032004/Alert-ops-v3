import type { NotificationHistoryItem, SendNotificationPayload } from '~/types'

export default defineEventHandler(async (event): Promise<NotificationHistoryItem> => {
  const body = await readBody<SendNotificationPayload>(event)

  // Validate phía server route
  if (!body?.projectId || !body?.recipients?.length || !body?.subject || !body?.body) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields: projectId, recipients, subject, body'
    })
  }

  const config = useRuntimeConfig()
  const authHeaders = forwardAuthHeader(event)

  // ✅ Convert plain text → HTML để Gmail/Outlook render xuống dòng đúng
  // Thứ tự escape quan trọng: & trước, sau đó < > , cuối cùng mới \n → <br>
  const bodyHtml = (body.body ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')

  const payload = {
    ...body,
    body: bodyHtml,           // ← gửi HTML thay vì plain text
    alertId: body.alertId ?? '',
    type: body.type ?? 'manual',
    channel: body.channel ?? 'email'
  }

  try {
    const data = await $fetch<NotificationHistoryItem>(
      `${config.apiBase}/api/notificationhistory/send`,
      {
        method: 'POST',
        body: payload,
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      }
    )
    return data
  } catch (err: any) {
    const status = err?.response?.status ?? err?.statusCode ?? 500
    const message = err?.data?.message ?? err?.message ?? 'Failed to send notification'
    throw createError({ statusCode: status, statusMessage: message })
  }
})