import { ref } from 'vue'
import type { Language } from './useI18n'

// Định nghĩa cấu trúc đầy đủ của hệ thống
export interface UserPreferences {
  theme: 'dark' | 'light' | 'auto'
  language: Language
  emailNotifications: boolean
  slackNotifications: boolean
  autoRefreshAlerts: boolean
  refreshInterval: number
  alertsPerPage: number
  compactView: boolean
  timezone: string
  dateFormat: string

  // Font settings (thay thế accentColor)
  fontFamily: string
  fontSize: number

  criticalOnly: boolean
  soundEnabled: boolean
  soundVolume: number
  quietHours: boolean
  quietFrom: string
  quietTo: string
  defaultSeverityFilter: string
  showResolved: boolean
}

const STORAGE_KEY = 'alertops-settings-v3'

// Giá trị mặc định đầy đủ
const defaultPreferences: UserPreferences = {
  theme: 'dark',
  language: 'vi',
  emailNotifications: true,
  slackNotifications: false,
  autoRefreshAlerts: true,
  refreshInterval: 30,
  alertsPerPage: 20,
  compactView: false,
  timezone: 'Asia/Ho_Chi_Minh',
  dateFormat: 'DD/MM/YYYY',

  // Font defaults
  fontFamily: 'Inter, sans-serif',
  fontSize: 14,

  criticalOnly: false,
  soundEnabled: true,
  soundVolume: 60,
  quietHours: false,
  quietFrom: '22:00',
  quietTo: '07:00',
  defaultSeverityFilter: 'all',
  showResolved: true,
}

const preferences = ref<UserPreferences>({ ...defaultPreferences })

const loadPreferences = () => {
  if (import.meta.client) {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        preferences.value = {
          ...defaultPreferences,
          ...JSON.parse(saved)
        }
      } catch (e) {
        console.error('Failed to parse preferences:', e)
      }
    }
  }
}

if (import.meta.client) {
  loadPreferences()
}

export const useUserPreferences = () => {
  const savePreferences = (newPrefs: Partial<UserPreferences>) => {
    preferences.value = {
      ...preferences.value,
      ...newPrefs
    }
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences.value))
    }
  }

  const resetPreferences = () => {
    preferences.value = { ...defaultPreferences }
    if (import.meta.client) {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  return {
    preferences,
    loadPreferences,
    savePreferences,
    resetPreferences
  }
}