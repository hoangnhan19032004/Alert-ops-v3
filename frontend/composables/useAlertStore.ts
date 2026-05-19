// composables/useAlertStore.ts
import type { EscalationRule } from '~/types'

// ========== ESCALATION RULES ==========
export const useEscRules = () => {
  const { apiCall } = useApi()
  const { error: showError } = useToast()

  const escRules        = useState<EscalationRule[]>('escRules', () => [])
  const escRulesLoading = useState('escRules-loading', () => false)

  // Load rules from API
  const loadRules = async () => {
    escRulesLoading.value = true
    try {
      const response = await apiCall<EscalationRule[]>('/api/escalationrules')
      if (response.success && response.data) {
        escRules.value = response.data
      } else {
        console.warn('Failed to load rules:', response.message)
        showError('Không thể tải rules từ API')
      }
    } catch (err) {
      console.error('Error loading rules:', err)
      showError('Lỗi khi kết nối API')
    } finally {
      escRulesLoading.value = false
    }
  }

  // Create rule
  const createRule = async (rule: EscalationRule) => {
    try {
      const response = await apiCall<EscalationRule>('/api/escalationrules', {
        method: 'POST',
        body: rule
      })
      if (response.success && response.data) {
        escRules.value.push(response.data)
        return true
      }
      return false
    } catch (err) {
      console.error('Error creating rule:', err)
      return false
    }
  }

  // Auto-load on first use
  if (typeof window !== 'undefined' && escRules.value.length === 0) {
    loadRules()
  }

  return { escRules, escRulesLoading, loadRules, createRule }
}
