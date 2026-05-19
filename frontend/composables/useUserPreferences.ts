import { ref, onMounted } from 'vue'
import type { Language } from './useI18n'

export interface UserPreferences {
  theme: 'dark' | 'light' | 'auto'
  language: Language
  emailNotifications: boolean
  slackNotifications: boolean
  autoRefreshAlerts: boolean
  refreshInterval: number
  alertsPerPage: number
  compactView: boolean
}

const defaultPreferences: UserPreferences = {
  theme: 'auto',
  language: 'vi',
  emailNotifications: true,
  slackNotifications: true,
  autoRefreshAlerts: true,
  refreshInterval: 30,
  alertsPerPage: 10,
  compactView: false
}

export const useUserPreferences = () => {
  const preferences = ref<UserPreferences>({ ...defaultPreferences })

  const loadPreferences = () => {
    if (import.meta.client) {
      const saved = localStorage.getItem('userPreferences')
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

  const savePreferences = (newPrefs: Partial<UserPreferences>) => {
    preferences.value = {
      ...preferences.value,
      ...newPrefs
    }

    if (import.meta.client) {
      localStorage.setItem('userPreferences', JSON.stringify(preferences.value))
    }
  }

  const resetPreferences = () => {
    preferences.value = { ...defaultPreferences }

    if (import.meta.client) {
      localStorage.removeItem('userPreferences')
    }
  }

  onMounted(() => {
    loadPreferences()
  })

  return {
    preferences,
    loadPreferences,
    savePreferences,
    resetPreferences
  }
}