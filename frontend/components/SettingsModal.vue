<template>
  <div class="settings-modal-overlay" @click.self="closeModal">
    <div class="settings-modal">
      <div class="modal-header">
        <h2 class="modal-title">{{ t('settings') }}</h2>
        <button class="modal-close" @click="closeModal" aria-label="Close">
          <Icon name="lucide:x" />
        </button>
      </div>

      <div class="modal-content">
        <!-- Appearance Section -->
        <section class="settings-section">
          <h3 class="section-title">{{ t('appearance') }}</h3>
          <div class="setting-item">
            <div class="setting-label">
              <span class="label-text">{{ t('theme') }}</span>
              <span class="label-desc">{{ t('themeDesc') }}</span>
            </div>
            <div class="theme-selector">
              <button
                v-for="themeOption in ['auto', 'light', 'dark']"
                :key="themeOption"
                class="theme-btn"
                :class="{ active: preferences.theme === themeOption }"
                @click="preferences.theme = themeOption as 'auto' | 'light' | 'dark'"
              >
                <Icon
                  v-if="themeOption === 'auto'"
                  name="lucide:monitor"
                />
                <Icon
                  v-else-if="themeOption === 'light'"
                  name="lucide:sun"
                />
                <Icon
                  v-else
                  name="lucide:moon"
                />
                <span class="capitalize">{{ themeOption }}</span>
              </button>
            </div>
          </div>

          <div class="setting-item">
            <label class="setting-label toggle-label">
              <input
                v-model="preferences.compactView"
                type="checkbox"
              />
              <span class="label-text">{{ t('compactView') }}</span>
              <span class="label-desc">{{ t('compactViewDesc') }}</span>
            </label>
          </div>
        </section>

        <!-- Language Section -->
        <section class="settings-section">
          <h3 class="section-title">{{ t('language') }}</h3>
          <div class="setting-item">
            <div class="setting-label">
              <span class="label-text">{{ t('language') }}</span>
              <span class="label-desc">{{ t('languageDesc') }}</span>
            </div>
            <div class="language-selector">
              <button
                v-for="lang in ['vi', 'en']"
                :key="lang"
                class="lang-btn"
                :class="{ active: preferences.language === lang }"
                @click="selectLanguage(lang as 'vi' | 'en')"
              >
                <span>{{ lang === 'vi' ? t('vietnamese') : t('english') }}</span>
              </button>
            </div>
          </div>
        </section>

        <!-- Notifications Section -->
        <section class="settings-section">
          <h3 class="section-title">{{ t('notifications') }}</h3>

          <div class="setting-item">
            <label class="setting-label toggle-label">
              <input
                v-model="preferences.emailNotifications"
                type="checkbox"
              />
              <span class="label-text">{{ t('emailNotifications') }}</span>
              <span class="label-desc">{{ t('emailNotificationsDesc') }}</span>
            </label>
          </div>

          <div class="setting-item">
            <label class="setting-label toggle-label">
              <input
                v-model="preferences.slackNotifications"
                type="checkbox"
              />
              <span class="label-text">{{ t('slackNotifications') }}</span>
              <span class="label-desc">{{ t('slackNotificationsDesc') }}</span>
            </label>
          </div>

          <div class="setting-item">
            <label class="setting-label toggle-label">
              <input
                v-model="preferences.autoRefreshAlerts"
                type="checkbox"
              />
              <span class="label-text">{{ t('autoRefreshAlerts') }}</span>
              <span class="label-desc">{{ t('autoRefreshAlertsDesc') }}</span>
            </label>
          </div>

          <div v-if="preferences.autoRefreshAlerts" class="setting-item">
            <div class="setting-label">
              <span class="label-text">{{ t('refreshInterval') }}</span>
              <span class="label-desc">{{ t('refreshIntervalDesc') }}</span>
            </div>
            <div class="input-group">
              <input
                v-model.number="preferences.refreshInterval"
                type="number"
                min="10"
                max="300"
                step="10"
                class="number-input"
              />
              <span class="input-suffix">{{ t('seconds') }}</span>
            </div>
          </div>
        </section>

        <!-- Display Section -->
        <section class="settings-section">
          <h3 class="section-title">{{ t('display') }}</h3>

          <div class="setting-item">
            <div class="setting-label">
              <span class="label-text">{{ t('alertsPerPage') }}</span>
              <span class="label-desc">{{ t('alertsPerPageDesc') }}</span>
            </div>
            <div class="input-group">
              <input
                v-model.number="preferences.alertsPerPage"
                type="number"
                min="5"
                max="100"
                step="5"
                class="number-input"
              />
            </div>
          </div>
        </section>

        <!-- Account Section -->
        <section class="settings-section">
          <h3 class="section-title">{{ t('account') }}</h3>
          <div class="setting-item">
            <button class="danger-btn" @click="handleResetSettings">
              <Icon name="lucide:rotate-ccw" />
              {{ t('resetToDefaults') }}
            </button>
          </div>
        </section>
      </div>

      <div class="modal-footer">
        <button class="btn-cancel" @click="closeModal">{{ t('cancel') }}</button>
        <button class="btn-save" @click="saveSettings">
          <Icon name="lucide:save" />
          {{ t('save') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useUserPreferences } from '~/composables/useUserPreferences'
import { useToast } from '~/composables/useToast'
import { useTheme } from '~/composables/useTheme'
import { useI18n } from '~/composables/useI18n'

const emit = defineEmits<{
  close: []
}>()

const { preferences: userPreferences, savePreferences, resetPreferences } = useUserPreferences()
const { success, info } = useToast()
const { setTheme } = useTheme()
const { t, setLanguage } = useI18n()

const preferences = ref({ ...userPreferences.value })

// Watch for theme changes and apply them immediately
watch(() => preferences.value.theme, (newTheme) => {
  setTheme(newTheme as 'dark' | 'light' | 'auto')
})

// Watch for language changes
watch(() => preferences.value.language, (newLang) => {
  setLanguage(newLang)
})

const selectLanguage = (lang: 'vi' | 'en') => {
  preferences.value.language = lang
  setLanguage(lang)
}

const closeModal = () => {
  emit('close')
}

const saveSettings = () => {
  savePreferences(preferences.value)
  
  // Apply theme when saving
  setTheme(preferences.value.theme as 'dark' | 'light' | 'auto')
  
  // Apply language when saving
  setLanguage(preferences.value.language)
  
  success(t('settingsSaved'))
  closeModal()
}

const handleResetSettings = () => {
  if (confirm(t('confirmReset'))) {
    resetPreferences()
    preferences.value = { ...userPreferences.value }
    setLanguage(preferences.value.language)
    info(t('settingsReset'))
  }
}
</script>

<style scoped>
/* Light theme */
:root.light {
  --bg-primary: #ffffff;
  --bg-secondary: #f6f8fa;
  --bg-tertiary: #eaeef2;
  --border-color: #d1d9e0;
  --text-primary: #24292f;
  --text-secondary: #656d76;
  --text-tertiary: #8c959f;
  --accent-color: #0969da;
  --accent-hover: #0860ca;
}

/* Dark theme */
:root.dark {
  --bg-primary: #0d1117;
  --bg-secondary: #161b22;
  --bg-tertiary: #1e2735;
  --border-color: #1e2735;
  --text-primary: #e6edf3;
  --text-secondary: #c9d1d9;
  --text-tertiary: #8b949e;
  --accent-color: #58a6ff;
  --accent-hover: #79c0ff;
}

.settings-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
}

.settings-modal {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  width: 90%;
  max-width: 500px;
  max-height: 85vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.modal-close {
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.15s;
}

.modal-close:hover {
  color: var(--text-secondary);
}

.modal-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.settings-section {
  margin-bottom: 24px;
}

.settings-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.setting-item {
  margin-bottom: 16px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-label {
  display: block;
  margin-bottom: 8px;
  cursor: pointer;
}

.label-text {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 2px;
}

.label-desc {
  display: block;
  font-size: 12px;
  color: var(--text-tertiary);
}

.toggle-label {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.toggle-label input[type="checkbox"] {
  margin-top: 3px;
  cursor: pointer;
  accent-color: var(--accent-color);
}

.toggle-label .label-text {
  margin-bottom: 0;
}

.theme-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.theme-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-tertiary);
  cursor: pointer;
  font-size: 12px;
  transition: all 0.15s;
}

.theme-btn:hover {
  border-color: var(--accent-color);
  color: var(--text-secondary);
}

.theme-btn.active {
  background: var(--accent-color);
  border-color: var(--accent-color);
  color: #fff;
}

.language-selector {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.lang-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-tertiary);
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.15s;
}

.lang-btn:hover {
  border-color: var(--accent-color);
  color: var(--text-secondary);
}

.lang-btn.active {
  background: var(--accent-color);
  border-color: var(--accent-color);
  color: #fff;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.number-input {
  flex: 1;
  padding: 8px 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 13px;
}

.number-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(88, 166, 255, 0.1);
}

.input-suffix {
  font-size: 12px;
  color: var(--text-tertiary);
}

.danger-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  background: transparent;
  border: 1px solid #f85149;
  border-radius: 6px;
  color: #f85149;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.15s;
}

.danger-btn:hover {
  background: rgba(248, 81, 73, 0.1);
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
}

.btn-cancel {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.15s;
}

.btn-cancel:hover {
  border-color: var(--text-tertiary);
}

.btn-save {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--accent-color);
  border: 1px solid var(--accent-color);
  border-radius: 6px;
  color: #fff;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.15s;
}

.btn-save:hover {
  background: var(--accent-hover);
  border-color: var(--accent-hover);
}

.capitalize {
  text-transform: capitalize;
}
</style>
