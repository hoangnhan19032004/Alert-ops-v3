import { computed, onMounted } from 'vue'

export interface Alert {
  id: string
  projectId?: string
  message: string
  service: string
  severity: string
  status?: string
  createdAt?: string
  env?: string
  time?: string
}

// ─── Helper: normalize một item từ API thành Alert ───
const mapAlert = (item: any): Alert => ({
  id:        item.id ?? item._id ?? item.Id ?? '',
  projectId: item.projectId ?? item.ProjectId ?? undefined,
  message:   item.message ?? item.Message ?? '',
  service:   item.service ?? item.Service ?? '',
  severity:  item.severity ?? item.Severity ?? 'Error',
  status:    item.status ?? item.Status ?? 'Open',
  env:       item.env ?? item.Env ?? 'Production',
  time:      item.time ?? item.Time ?? '',
  createdAt: item.createdAt ?? item.CreatedAt ?? undefined,
})

export const useErrorStore = () => {
  const { apiCall, healthCheck } = useApi()
  const { success, error: showError } = useToast()

  const alerts     = useState<Alert[]>('alerts',         () => [])
  const loading    = useState<boolean>('alerts-loading', () => false)
  const apiConnected = useState<boolean>('api-connected', () => false)

  // ===== LOAD =====
  const loadAlerts = async () => {
    loading.value = true
    try {
      const res = await apiCall<any[]>('/api/alerts')

      if (res?.success && Array.isArray(res.data)) {
        alerts.value    = res.data.map(mapAlert)
        apiConnected.value = true
      } else {
        apiConnected.value = false
        showError('API không khả dụng')
      }
    } catch (err) {
      console.error(err)
      apiConnected.value = false
      showError('Lỗi khi kết nối API')
    } finally {
      loading.value = false
    }
  }

  // ===== CREATE =====
  const createAlert = async (data: Omit<Alert, 'id' | 'createdAt'>) => {
    try {
      const res = await apiCall<any>('/api/alerts', {
        method: 'POST',
        body: data
      })

      if (res?.success && res.data) {
        // Backend trả về Alert object — normalize rồi đảm bảo projectId không bị mất
        const created = mapAlert(res.data)
        // Nếu backend chưa có ProjectId field, fallback về giá trị frontend gửi lên
        if (!created.projectId && data.projectId) {
          created.projectId = data.projectId
        }
        alerts.value.unshift(created)
        success('Tạo alert thành công!')
        return true
      }

      showError('Tạo alert thất bại')
      return false
    } catch (err) {
      console.error(err)
      showError('Lỗi khi tạo alert')
      return false
    }
  }

  // ===== UPDATE =====
  const updateAlert = async (id: string, data: Partial<Alert>) => {
    const index = alerts.value.findIndex(a => a.id === id)
    if (index === -1) return false

    // Optimistic update ngay lập tức để UI không bị lag
    const old = { ...alerts.value[index]! }
    alerts.value[index] = { ...old, ...data, id, createdAt: old.createdAt }

    // Build full body — backend dùng ReplaceOne nên cần tất cả fields
    const current = alerts.value[index]!
    const fullBody = {
      message:   current.message,
      service:   current.service,
      severity:  current.severity,
      status:    current.status,
      env:       current.env,
      time:      current.time ?? '',
      createdAt: old.createdAt,
      projectId: current.projectId ?? null,  // QUAN TRỌNG: phải gửi để không bị ReplaceOne xóa mất
    }

    try {
      const res = await apiCall(`/api/alerts/${id}`, {
        method: 'PUT',
        body: fullBody
      })

      // PUT trả về 204 NoContent → res.success = true, res.data = null — đây là đúng
      if (res?.success) {
        return true
      }

      // Rollback nếu API lỗi
      alerts.value[index] = old
      showError('Cập nhật thất bại')
      return false
    } catch (err) {
      console.error(err)
      alerts.value[index] = old
      showError('Lỗi khi cập nhật')
      return false
    }
  }

  // ===== DELETE =====
  const deleteAlert = async (id: string) => {
    try {
      const res = await apiCall(`/api/alerts/${id}`, { method: 'DELETE' })

      if (res?.success) {
        alerts.value = alerts.value.filter(a => a.id !== id)
        success('Xoá thành công!')
        return true
      }

      return false
    } catch (err) {
      console.error(err)
      showError('Lỗi khi xoá')
      return false
    }
  }

  // ===== CHECK =====
  const checkConnection = async () => {
    try {
      apiConnected.value = await healthCheck()
      return apiConnected.value
    } catch {
      apiConnected.value = false
      return false
    }
  }

  return {
    alerts,
    loading,
    apiConnected,

    loadAlerts,
    createAlert,
    updateAlert,
    deleteAlert,
    checkConnection,

    alertCount:    computed(() => alerts.value.length),
    criticalAlerts: computed(() => alerts.value.filter(a => a.severity === 'Critical')),
    recentAlerts:  computed(() => alerts.value.slice(0, 10)),
  }
}