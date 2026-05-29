<template>
  <div class="settings-modal-overlay" @click.self="closeModal">
    <div class="settings-modal">

      <!-- Header -->
      <div class="modal-header">
        <div class="header-left">
          <div class="header-icon-wrap">
            <Icon name="lucide:settings" class="header-icon" />
          </div>
          <div>
            <h2 class="modal-title">{{ t('settings') }}</h2>
            <p class="modal-subtitle">{{ currentUser?.email || '' }}</p>
          </div>
        </div>
        <button class="modal-close" @click="closeModal" aria-label="Close">
          <Icon name="lucide:x" />
        </button>
      </div>

      <!-- Body: sidebar + content -->
      <div class="modal-body" :key="language">

        <!-- Sidebar nav -->
        <nav class="settings-nav">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="nav-item"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            <Icon :name="tab.icon" class="nav-icon" />
            <span>{{ t(tab.id as any) }}</span>
            <span v-if="tab.badge" class="nav-badge">{{ tab.badge }}</span>
          </button>

          <div class="nav-divider"></div>

          <div class="nav-user-card">
            <div class="user-avatar">{{ userInitials }}</div>
            <div class="user-info">
              <span class="user-name">{{ currentUser?.name || '—' }}</span>
              <span class="user-role">{{ currentUser?.role ? t(currentUser.role.toLowerCase() as any) : '—' }}</span>
            </div>
          </div>
        </nav>

        <!-- Content panels -->
        <div class="settings-content">

          <!-- ── TAB: Appearance ── -->
          <div v-if="activeTab === 'appearance'" class="tab-panel">
            <div class="panel-title">{{ t('appearance') }}</div>

            <!-- Theme -->
            <div class="setting-card">
              <div class="card-label-row">
                <div>
                  <span class="label-text">{{ t('theme') }}</span>
                  <span class="label-desc">{{ t('themeDesc') }}</span>
                </div>
              </div>
              <div class="theme-selector">
                <button
                  v-for="opt in themeOptions"
                  :key="opt.value"
                  class="theme-btn"
                  :class="{ active: preferences.theme === opt.value }"
                  @click="preferences.theme = opt.value"
                >
                  <Icon :name="opt.icon" class="theme-icon" />
                  <span>{{ t(opt.label as any) }}</span>
                </button>
              </div>
            </div>

            <!-- Font Family -->
            <div class="setting-card">
              <div class="card-label-row">
                <div>
                  <span class="label-text">{{ t('fontFamily') }}</span>
                  <span class="label-desc">{{ t('fontFamilyDesc') }}</span>
                </div>
              </div>
              <div class="font-grid">
                <button
                  v-for="f in fontOptions"
                  :key="f.value"
                  class="font-btn"
                  :class="{ active: preferences.fontFamily === f.value }"
                  :style="{ fontFamily: f.value }"
                  @click="preferences.fontFamily = f.value"
                >
                  <Icon v-if="preferences.fontFamily === f.value" name="lucide:check" class="check-icon" />
                  <span class="font-preview-sample">Aa</span>
                  <span class="font-label">{{ f.label }}</span>
                </button>
              </div>
            </div>

            <!-- Font Size -->
            <div class="setting-card">
              <div class="card-label-row">
                <div>
                  <span class="label-text">{{ t('fontSize') }}</span>
                  <span class="label-desc">{{ t('fontSizeDesc') }}</span>
                </div>
                <span class="font-size-value">{{ preferences.fontSize }}px</span>
              </div>
              <div class="font-size-row">
                <span class="size-label">A</span>
                <input
                  type="range"
                  min="12"
                  max="20"
                  step="1"
                  v-model.number="preferences.fontSize"
                  class="font-slider"
                />
                <span class="size-label large">A</span>
              </div>
              <p
                class="font-preview-text"
                :style="{ fontFamily: preferences.fontFamily, fontSize: preferences.fontSize + 'px' }"
              >
                {{ t('fontPreviewText') }}
              </p>
            </div>
          </div>

          <!-- ── TAB: Language & Region ── -->
          <div v-if="activeTab === 'language'" class="tab-panel">
            <div class="panel-title">{{ t('languageRegion') }}</div>

            <!-- Language -->
            <div class="setting-card">
              <div class="card-label-row">
                <div>
                  <span class="label-text">{{ t('language') }}</span>
                  <span class="label-desc">{{ t('languageDesc') }}</span>
                </div>
              </div>
              <div class="language-selector">
                <button
                  v-for="lang in ['vi', 'en']"
                  :key="lang"
                  class="lang-btn"
                  :class="{ active: preferences.language === lang }"
                  @click="selectLanguage(lang as 'vi' | 'en')"
                >
                  <span class="flag">{{ lang === 'vi' ? '🇻🇳' : '🇺🇸' }}</span>
                  <span>{{ lang === 'vi' ? t('vietnamese') : t('english') }}</span>
                </button>
              </div>
            </div>

            <!-- Date format -->
            <div class="setting-card">
              <div class="card-label-row">
                <div>
                  <span class="label-text">{{ t('dateFormat') }}</span>
                  <span class="label-desc">{{ t('preview') }}: {{ datePreview }}</span>
                </div>
              </div>
              <div class="date-format-group">
                <button
                  v-for="fmt in dateFormats"
                  :key="fmt.value"
                  class="format-btn"
                  :class="{ active: preferences.dateFormat === fmt.value }"
                  @click="preferences.dateFormat = fmt.value"
                >{{ fmt.label }}</button>
              </div>
            </div>
          </div>

          <!-- ── TAB: Notifications ── -->
          <div v-if="activeTab === 'notifications'" class="tab-panel">
            <div class="panel-title">{{ t('notifications') }}</div>

            <div class="setting-card">
              <label class="toggle-row">
                <div>
                  <span class="label-text">{{ t('emailNotifications') }}</span>
                  <span class="label-desc">{{ t('emailNotificationsDesc') }}</span>
                </div>
                <div class="toggle-wrap">
                  <input v-model="preferences.emailNotifications" type="checkbox" class="toggle-input" id="email-notif" />
                  <label for="email-notif" class="toggle-track"><span class="toggle-thumb"></span></label>
                </div>
              </label>
            </div>

            <div class="setting-card">
              <label class="toggle-row">
                <div>
                  <span class="label-text">{{ t('slackNotifications') }}</span>
                  <span class="label-desc">{{ t('slackNotificationsDesc') }}</span>
                </div>
                <div class="toggle-wrap">
                  <input v-model="preferences.slackNotifications" type="checkbox" class="toggle-input" id="slack-notif" />
                  <label for="slack-notif" class="toggle-track"><span class="toggle-thumb"></span></label>
                </div>
              </label>
            </div>

            <div class="setting-card">
              <label class="toggle-row">
                <div>
                  <span class="label-text">{{ t('criticalOnly') }}</span>
                  <span class="label-desc">{{ t('criticalOnlyDesc') }}</span>
                </div>
                <div class="toggle-wrap">
                  <input v-model="preferences.criticalOnly" type="checkbox" class="toggle-input" id="critical-only" />
                  <label for="critical-only" class="toggle-track"><span class="toggle-thumb"></span></label>
                </div>
              </label>
            </div>

            <div class="setting-card">
              <div class="toggle-row">
                <div>
                  <span class="label-text">{{ t('browserNotifications') }}</span>
                  <span class="label-desc">{{ t('browserNotificationsDesc') }}</span>
                </div>
                <button
                  class="permission-btn"
                  :class="`permission-btn ${pushPermission}`"
                  @click="requestPushPermission"
                >
                  <Icon :name="pushIcon" />
                  {{ pushLabel }}
                </button>
              </div>
            </div>

            <div class="setting-card">
              <label class="toggle-row">
                <div>
                  <span class="label-text">{{ t('soundNotifications') }}</span>
                  <span class="label-desc">{{ t('soundNotificationsDesc') }}</span>
                </div>
                <div class="toggle-wrap">
                  <input v-model="preferences.soundEnabled" type="checkbox" class="toggle-input" id="sound" />
                  <label for="sound" class="toggle-track"><span class="toggle-thumb"></span></label>
                </div>
              </label>
            </div>

            <div v-if="preferences.soundEnabled" class="setting-card">
              <div class="card-label-row">
                <div>
                  <span class="label-text">{{ t('volume') }}</span>
                  <span class="label-desc">{{ preferences.soundVolume }}%</span>
                </div>
                <button class="test-sound-btn" @click="testSound">
                  <Icon name="lucide:volume-2" /> {{ t('test') }}
                </button>
              </div>
              <input
                v-model.number="preferences.soundVolume"
                type="range" min="10" max="100" step="10"
                class="volume-slider"
              />
              <div class="slider-labels"><span>10%</span><span>100%</span></div>
            </div>

            <div class="setting-card">
              <label class="toggle-row">
                <div>
                  <span class="label-text">{{ t('quietHours') }}</span>
                  <span class="label-desc">{{ t('quietHoursDesc') }}</span>
                </div>
                <div class="toggle-wrap">
                  <input v-model="preferences.quietHours" type="checkbox" class="toggle-input" id="quiet" />
                  <label for="quiet" class="toggle-track"><span class="toggle-thumb"></span></label>
                </div>
              </label>
              <div v-if="preferences.quietHours" class="time-range">
                <div class="time-field">
                  <label class="time-label">{{ t('from') }}</label>
                  <input v-model="preferences.quietFrom" type="time" class="time-input" />
                </div>
                <Icon name="lucide:arrow-right" class="time-arrow" />
                <div class="time-field">
                  <label class="time-label">{{ t('to') }}</label>
                  <input v-model="preferences.quietTo" type="time" class="time-input" />
                </div>
              </div>
            </div>
          </div>

          <!-- ── TAB: Display ── -->
          <div v-if="activeTab === 'display'" class="tab-panel">
            <div class="panel-title">{{ t('display') }}</div>

            <div class="setting-card">
              <div class="card-label-row">
                <div>
                  <span class="label-text">{{ t('alertsPerPage') }}</span>
                  <span class="label-desc">{{ t('alertsPerPageDesc') }}</span>
                </div>
                <div class="num-wrap">
                  <input v-model.number="preferences.alertsPerPage" type="number" min="5" max="100" step="5" class="num-input" />
                </div>
              </div>
            </div>

            <div class="setting-card">
              <label class="toggle-row">
                <div>
                  <span class="label-text">{{ t('autoRefreshAlerts') }}</span>
                  <span class="label-desc">{{ t('autoRefreshAlertsDesc') }}</span>
                </div>
                <div class="toggle-wrap">
                  <input v-model="preferences.autoRefreshAlerts" type="checkbox" class="toggle-input" id="auto-refresh" />
                  <label for="auto-refresh" class="toggle-track"><span class="toggle-thumb"></span></label>
                </div>
              </label>
            </div>

            <div v-if="preferences.autoRefreshAlerts" class="setting-card">
              <div class="card-label-row">
                <div>
                  <span class="label-text">{{ t('refreshInterval') }}</span>
                  <span class="label-desc">{{ t('refreshIntervalDesc') }}</span>
                </div>
                <div class="num-wrap">
                  <input v-model.number="preferences.refreshInterval" type="number" min="10" max="300" step="10" class="num-input" />
                  <span class="num-unit">{{ t('seconds') }}</span>
                </div>
              </div>
            </div>

            <div class="setting-card">
              <div class="card-label-row">
                <div>
                  <span class="label-text">{{ t('defaultFilter') }}</span>
                  <span class="label-desc">{{ t('defaultFilterDesc') }}</span>
                </div>
              </div>
              <div class="severity-filter-group">
                <button
                  v-for="sev in severities"
                  :key="sev.value"
                  class="sev-btn"
                  :class="[sev.cls, { active: preferences.defaultSeverityFilter === sev.value }]"
                  @click="preferences.defaultSeverityFilter = sev.value"
                >{{ t(sev.label as any) }}</button>
              </div>
            </div>

            <div class="setting-card">
              <label class="toggle-row">
                <div>
                  <span class="label-text">{{ t('showResolved') }}</span>
                  <span class="label-desc">{{ t('showResolvedDesc') }}</span>
                </div>
                <div class="toggle-wrap">
                  <input v-model="preferences.showResolved" type="checkbox" class="toggle-input" id="show-resolved" />
                  <label for="show-resolved" class="toggle-track"><span class="toggle-thumb"></span></label>
                </div>
              </label>
            </div>
          </div>

          <!-- ── TAB: Shortcuts ── -->
          <div v-if="activeTab === 'shortcuts'" class="tab-panel">
            <div class="panel-title">{{ t('shortcuts') }}</div>
            <div class="shortcut-desc">{{ t('shortcutsDesc') }}</div>

            <div class="shortcut-list">
              <div class="shortcut-row" v-for="s in shortcuts" :key="s.label">
                <span class="shortcut-label">{{ t(s.label as any) }}</span>
                <div class="shortcut-keys">
                  <kbd class="kbd">Ctrl</kbd>
                  <span class="key-plus">+</span>
                  <kbd v-for="k in s.keys" :key="k" class="kbd">{{ k }}</kbd>
                </div>
              </div>
            </div>

            <div class="panel-title" style="margin-top: 20px;">{{ t('version') }}</div>
            <div class="version-card">
              <div class="version-row">
                <span class="version-label">App</span>
                <span class="version-value">AlertOps v3.0.0</span>
              </div>
              <div class="version-row">
                <span class="version-label">API</span>
                <span class="version-value status-ok">● {{ t('connectedStatus') }}</span>
              </div>
              <div class="version-row">
                <span class="version-label">{{ t('build') }}</span>
                <span class="version-value">{{ buildDate }}</span>
              </div>
            </div>
          </div>

          <!-- ── TAB: Account ── -->
          <div v-if="activeTab === 'account'" class="tab-panel">
            <div class="panel-title">{{ t('account') }}</div>

            <div class="setting-card account-info-card">
              <div class="account-avatar">{{ userInitials }}</div>
              <div class="account-meta">
                <span class="account-name">{{ currentUser?.name || '—' }}</span>
                <span class="account-email">{{ currentUser?.email || '—' }}</span>
                <span class="role-badge" :class="`role-${currentUser?.role?.toLowerCase()}`">{{ currentUser?.role ? t(currentUser.role.toLowerCase() as any) : '' }}</span>
              </div>
            </div>

            <div class="setting-card">
              <div class="panel-title" style="font-size:13px; margin-bottom:12px;">{{ t('changePassword') }}</div>
              <div class="field-group">
                <div class="field-item">
                  <label class="field-label">{{ t('currentPassword') }}</label>
                  <input v-model="pwForm.current" type="password" class="text-input" placeholder="••••••••" />
                </div>
                <div class="field-item">
                  <label class="field-label">{{ t('newPassword') }}</label>
                  <input v-model="pwForm.next" type="password" class="text-input" placeholder="••••••••" />
                </div>
                <div class="field-item">
                  <label class="field-label">{{ t('confirmPassword') }}</label>
                  <input v-model="pwForm.confirm" type="password" class="text-input" placeholder="••••••••" />
                </div>
                <div v-if="pwError" class="pw-error">{{ pwError }}</div>
                <button class="save-pw-btn" @click="changePassword" :disabled="!canSavePassword">
                  <Icon name="lucide:shield-check" /> {{ t('updatePassword') }}
                </button>
              </div>
            </div>

            <div class="setting-card danger-card">
              <div class="danger-title">
                <Icon name="lucide:shield-alert" /> {{ t('dangerZone') }}
              </div>
              <div class="danger-desc">{{ t('dangerZoneDesc') }}</div>
              <button class="danger-btn" @click="handleResetSettings">
                <Icon name="lucide:rotate-ccw" /> {{ t('resetToDefaults') }}
              </button>
            </div>
          </div>

        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <span class="unsaved-hint" v-if="hasChanges">● {{ t('unsavedChanges') }}</span>
        <button class="btn-cancel" @click="closeModal">{{ t('cancel') }}</button>
        <button
          class="btn-save"
          @click="saveSettings"
          :disabled="!hasChanges || saving"
        >
          <Icon name="lucide:save" /> {{ t('save') }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { useUserPreferences } from '~/composables/useUserPreferences'
import { useToast } from '~/composables/useToast'
import { useTheme } from '~/composables/useTheme'
import { useI18n } from '~/composables/useI18n'
import { useAuth } from '~/composables/useAuth'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

type ThemeMode = 'auto' | 'light' | 'dark'
type Language = 'vi' | 'en'

interface TabItem {
  id: string
  label: string
  icon: string
  badge?: string
}

interface ThemeOption {
  value: ThemeMode
  label: string
  icon: string
}

interface FontOption {
  value: string
  label: string
}

interface ExtendedPreferences {
  theme: ThemeMode
  language: Language

  emailNotifications: boolean
  slackNotifications: boolean

  alertsPerPage: number
  autoRefreshAlerts: boolean
  refreshInterval: number

  compactView: boolean

  soundEnabled: boolean
  soundVolume: number

  // Font settings (thay thế accentColor)
  fontFamily: string
  fontSize: number

  timezone: string
  dateFormat: string

  criticalOnly: boolean

  quietHours: boolean
  quietFrom: string
  quietTo: string

  defaultSeverityFilter: string
  showResolved: boolean
}

const router = useRouter()

const emit = defineEmits<{
  close: []
}>()

const { success, error, info } = useToast()
const { setTheme } = useTheme()
const { t, setLanguage, language } = useI18n()
const { currentUser } = useAuth()

const STORAGE_KEY = 'alertops-settings-v3'

const defaultPreferences: ExtendedPreferences = {
  theme: 'dark',
  language: 'vi',

  emailNotifications: true,
  slackNotifications: false,

  alertsPerPage: 20,
  autoRefreshAlerts: true,
  refreshInterval: 30,

  compactView: false,

  soundEnabled: true,
  soundVolume: 60,

  // Font defaults
  fontFamily: 'Inter, sans-serif',
  fontSize: 14,

  timezone: 'Asia/Ho_Chi_Minh',
  dateFormat: 'DD/MM/YYYY',

  criticalOnly: false,

  quietHours: false,
  quietFrom: '22:00',
  quietTo: '07:00',

  defaultSeverityFilter: 'all',
  showResolved: true,
}

const { preferences, savePreferences, resetPreferences } = useUserPreferences()

const originalPreferences = ref('')
const activeTab = ref('appearance')
const saving = ref(false)
const pushPermission = ref<NotificationPermission>('default')

const pwForm = ref({
  current: '',
  next: '',
  confirm: ''
})

const pwError = ref('')

/* =========================================
   UI DATA
========================================= */

const shortcuts = [
  { label: 'goToDashboard',  keys: ['D'] },
  { label: 'goToAlerts',     keys: ['A'] },
  { label: 'goToAnalytics',  keys: ['L'] },
  { label: 'goToProjects',   keys: ['P'] },
  { label: 'goToEscalation', keys: ['E'] },
]

const tabs: TabItem[] = [
  { id: 'appearance', label: 'appearance', icon: 'lucide:palette' },
  { id: 'language', label: 'language', icon: 'lucide:languages' },
  { id: 'notifications', label: 'notifications', icon: 'lucide:bell' },
  { id: 'display', label: 'display', icon: 'lucide:monitor' },
  { id: 'shortcuts', label: 'shortcuts', icon: 'lucide:keyboard' },
  { id: 'account', label: 'account', icon: 'lucide:user' }
]

const themeOptions: ThemeOption[] = [
  { value: 'auto', label: 'themeAuto', icon: 'lucide:monitor' },
  { value: 'light', label: 'themeLight', icon: 'lucide:sun' },
  { value: 'dark', label: 'themeDark', icon: 'lucide:moon' }
]

// Font options — thay thế accentColors
const fontOptions: FontOption[] = [
  { value: 'Inter, sans-serif',            label: 'Inter' },
  { value: 'Roboto, sans-serif',           label: 'Roboto' },
  { value: 'Poppins, sans-serif',          label: 'Poppins' },
  { value: 'Nunito, sans-serif',           label: 'Nunito' },
  { value: "'JetBrains Mono', monospace",  label: 'Mono' },
]

const dateFormats = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'YYYY-MM-DD', label: 'ISO 8601' }
]

const severities = [
  { value: 'all', label: 'all', cls: 'sev-all' },
  { value: 'Critical', label: 'critical', cls: 'sev-critical' },
  { value: 'Error', label: 'error', cls: 'sev-error' },
  { value: 'Warning', label: 'warning', cls: 'sev-warning' }
]

const buildDate = computed(() =>
  new Date().toLocaleDateString('vi-VN')
)

/* =========================================
   TICKER
========================================= */

const nowTicker = ref(Date.now())
let tickerInterval: ReturnType<typeof setInterval>

/* =========================================
   KEYBOARD SHORTCUTS LOGIC
========================================= */

const executeShortcutAction = (label: string) => {
  switch (label) {
    case 'goToDashboard':  if (router) router.push('/'); break
    case 'goToAlerts':     if (router) router.push('/alerts'); break
    case 'goToAnalytics':  if (router) router.push('/analytics'); break
    case 'goToProjects':   if (router) router.push('/projects'); break
    case 'goToEscalation': if (router) router.push('/escalation'); break
    default: console.warn(`Chưa cấu hình hành động cho nhãn: ${label}`); break
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  const target = e.target as HTMLElement
  if (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.isContentEditable
  ) return

  if (!e.ctrlKey && !e.metaKey) return

  let pressedKey = e.key
  if (pressedKey.length === 1) pressedKey = pressedKey.toUpperCase()

  const matchedShortcut = shortcuts.find(s => s.keys[0] === pressedKey)
  if (matchedShortcut) {
    e.preventDefault()
    executeShortcutAction(matchedShortcut.label)
  }
}

const registerShortcuts   = () => window.addEventListener('keydown', handleKeydown)
const unregisterShortcuts = () => window.removeEventListener('keydown', handleKeydown)

/* =========================================
   COMPUTED
========================================= */

const hasChanges = computed(() =>
  JSON.stringify(preferences.value) !== originalPreferences.value
)

const userInitials = computed(() => {
  const name = currentUser.value?.name || ''
  return (
    name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase() || '?'
  )
})

const canSavePassword = computed(() =>
  pwForm.value.current.length > 0 &&
  pwForm.value.next.length >= 6 &&
  pwForm.value.next === pwForm.value.confirm
)

const pushIcon = computed(() => ({
  granted: 'lucide:check-circle',
  denied:  'lucide:x-circle',
  default: 'lucide:bell-plus'
}[pushPermission.value] || 'lucide:bell-plus'))

const pushLabel = computed(() => ({
  granted: t('pushGranted'),
  denied:  t('pushDenied'),
  default: t('pushDefault')
}[pushPermission.value] || t('pushDefault')))

const datePreview = computed(() => {
  void nowTicker.value
  return dayjs().tz(preferences.value.timezone).format(preferences.value.dateFormat)
})

/* =========================================
   WATCHERS
========================================= */

watch(() => preferences.value.theme,    (v) => setTheme(v))
watch(() => preferences.value.language, (v) => setLanguage(v))

// Áp dụng font lên toàn bộ app khi thay đổi
watch(() => preferences.value.fontFamily, (v) => applyFont(v, preferences.value.fontSize))
watch(() => preferences.value.fontSize,   (v) => applyFont(preferences.value.fontFamily, v))

watch(preferences, () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences.value))
}, { deep: true })

/* =========================================
   METHODS
========================================= */

const closeModal = () => emit('close')

const saveSettings = async () => {
  try {
    saving.value = true
    validateSettings()
    savePreferences(preferences.value)
    originalPreferences.value = JSON.stringify(preferences.value)
    success(t('settingsSaved'))
    closeModal()
  } catch (e: any) {
    error(e.message || t('settingsSaveError'))
  } finally {
    saving.value = false
  }
}

const validateSettings = () => {
  if (preferences.value.refreshInterval < 10 || preferences.value.refreshInterval > 300) {
    throw new Error(t('invalidRefreshInterval'))
  }
  if (preferences.value.alertsPerPage < 5 || preferences.value.alertsPerPage > 100) {
    throw new Error(t('invalidAlertsPerPage'))
  }
}

const handleResetSettings = () => {
  if (!confirm(t('confirmReset'))) return
  preferences.value = { ...defaultPreferences }
  setLanguage(defaultPreferences.language)
  resetPreferences()
  applyFont(defaultPreferences.fontFamily, defaultPreferences.fontSize)
  success(t('settingsReset'))
}

const selectLanguage = (lang: Language) => {
  preferences.value.language = lang
  setLanguage(lang)
}

// Áp dụng font & font-size lên :root
const applyFont = (family: string, size: number) => {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.style.setProperty('--font-family', family)
  root.style.setProperty('--font-size-base', `${size}px`)
}

const testSound = async () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    const ctx = new AudioCtx()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    oscillator.type = 'sine'
    oscillator.frequency.value = 880
    gainNode.gain.value = preferences.value.soundVolume / 100 / 2
    oscillator.start()
    setTimeout(() => { oscillator.stop(); ctx.close() }, 250)
  } catch {
    error(t('soundPlayError'))
  }
}

const requestPushPermission = async () => {
  if (typeof window === 'undefined') return
  if (!('Notification' in window)) { error(t('pushNotSupported')); return }
  const permission = await Notification.requestPermission()
  pushPermission.value = permission
  if (permission === 'granted') {
    new Notification('AlertOps', { body: t('pushEnabledMsg') })
    success(t('pushEnabledSuccess'))
  }
}

const changePassword = async () => {
  try {
    pwError.value = ''
    if (pwForm.value.next !== pwForm.value.confirm) throw new Error(t('passwordMismatch'))
    if (pwForm.value.next.length < 6) throw new Error(t('passwordTooShort'))
    success(t('passwordChangeSuccess'))
    pwForm.value = { current: '', next: '', confirm: '' }
  } catch (e: any) {
    pwError.value = e.message
  }
}

const loadLocalDraft = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw)
    preferences.value = { ...preferences.value, ...parsed }
    if (parsed.language) setLanguage(parsed.language)
  } catch {}
}

/* =========================================
   LIFECYCLES
========================================= */

onMounted(() => {
  tickerInterval = setInterval(() => { nowTicker.value = Date.now() }, 1000)
  originalPreferences.value = JSON.stringify(preferences.value)
  loadLocalDraft()
  if (typeof window !== 'undefined' && 'Notification' in window) {
    pushPermission.value = Notification.permission
  }
  applyFont(preferences.value.fontFamily, preferences.value.fontSize)
  registerShortcuts()
})

onUnmounted(() => {
  clearInterval(tickerInterval)
  unregisterShortcuts()
})
</script>

<style scoped>
/* ══════════════════════════════════════════════
   VARIABLES — light / dark
══════════════════════════════════════════════ */
.settings-modal-overlay {
  --bg-primary:    #ffffff;
  --bg-secondary:  #f6f8fa;
  --bg-tertiary:   #eaeef2;
  --border:        #d0d7de;
  --border-subtle: #eaeef2;
  --text-primary:  #1a1f2e;
  --text-muted:    #57606a;
  --text-hint:     #8c959f;
  --accent:        #2563eb;
  --accent-light:  rgba(37,99,235,0.08);
  --accent-text:   #ffffff;
  --danger:        #cf222e;
  --danger-bg:     rgba(207,34,46,0.06);
  --danger-hover:  rgba(207,34,46,0.12);
  --shadow:        0 16px 48px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06);
  --toggle-on:     #2563eb;
  --toggle-off:    #d0d7de;
  --nav-w:         200px;
}

:root.dark .settings-modal-overlay {
  --bg-primary:    #161b22;
  --bg-secondary:  #21262d;
  --bg-tertiary:   #2d333b;
  --border:        #30363d;
  --border-subtle: #21262d;
  --text-primary:  #e6edf3;
  --text-muted:    #c9d1d9;
  --text-hint:     #8b949e;
  --accent:        #58a6ff;
  --accent-light:  rgba(88,166,255,0.1);
  --accent-text:   #0d1117;
  --danger:        #f85149;
  --danger-bg:     rgba(248,81,73,0.08);
  --danger-hover:  rgba(248,81,73,0.15);
  --shadow:        0 16px 48px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.3);
  --toggle-on:     #58a6ff;
  --toggle-off:    #30363d;
}

/* ══════════════════════════════════════════════
   OVERLAY
══════════════════════════════════════════════ */
.settings-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
}

/* ══════════════════════════════════════════════
   MODAL SHELL
══════════════════════════════════════════════ */
.settings-modal {
  width: 100%;
  max-width: 860px;
  max-height: 90vh;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 20px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: var(--text-primary);
}

/* ══════════════════════════════════════════════
   HEADER
══════════════════════════════════════════════ */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-secondary);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon-wrap {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: var(--accent-light);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  font-size: 17px;
}

.modal-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.modal-subtitle {
  font-size: 11px;
  color: var(--text-hint);
  margin: 2px 0 0;
}

.modal-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-hint);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.15s;
}

.modal-close:hover {
  background: var(--bg-tertiary);
  border-color: var(--border);
  color: var(--text-muted);
}

/* ══════════════════════════════════════════════
   BODY
══════════════════════════════════════════════ */
.modal-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* ── Sidebar nav ── */
.settings-nav {
  width: var(--nav-w);
  flex-shrink: 0;
  border-right: 1px solid var(--border-subtle);
  background: var(--bg-secondary);
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 9px 12px;
  border-radius: 9px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
  width: 100%;
  position: relative;
}

.nav-item:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--accent-light);
  color: var(--accent);
  border: 1px solid var(--border);
}

.nav-icon { font-size: 15px; flex-shrink: 0; }

.nav-badge {
  margin-left: auto;
  background: var(--danger);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 10px;
}

.nav-divider {
  height: 1px;
  background: var(--border-subtle);
  margin: 8px 4px;
}

.nav-user-card {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 10px 12px;
  border-radius: 9px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  margin-top: auto;
}

.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--accent-light);
  color: var(--accent);
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid var(--border);
}

.user-info { display: flex; flex-direction: column; gap: 1px; overflow: hidden; }

.user-name {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role { font-size: 10px; color: var(--text-hint); }

/* ── Content area ── */
.settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}

.tab-panel { display: flex; flex-direction: column; gap: 12px; }

.panel-title {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-hint);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 4px;
}

/* ── Setting card ── */
.setting-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px 16px;
  transition: border-color 0.15s;
}

.setting-card:hover { border-color: var(--accent); }

.card-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.label-text {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.label-desc {
  display: block;
  font-size: 11px;
  color: var(--text-hint);
  margin-top: 2px;
  line-height: 1.4;
}

/* ── Toggle row ── */
.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  cursor: pointer;
}

.toggle-wrap { flex-shrink: 0; }
.toggle-input { display: none; }

.toggle-track {
  display: flex;
  align-items: center;
  width: 42px;
  height: 23px;
  border-radius: 12px;
  background: var(--toggle-off);
  border: 1px solid var(--border);
  padding: 2px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.toggle-input:checked + .toggle-track {
  background: var(--toggle-on);
  border-color: var(--toggle-on);
}

.toggle-thumb {
  width: 17px;
  height: 17px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
  display: block;
}

.toggle-input:checked + .toggle-track .toggle-thumb {
  transform: translateX(19px);
}

/* ── Theme selector ── */
.theme-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.theme-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  border-radius: 10px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.theme-icon { font-size: 18px; }
.theme-btn:hover { border-color: var(--accent); color: var(--accent); }
.theme-btn.active { background: var(--accent); border-color: var(--accent); color: var(--accent-text); }

/* ── Font family grid ── */
.font-grid {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.font-btn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 10px 14px;
  border-radius: 10px;
  background: var(--bg-primary);
  border: 2px solid var(--border);
  cursor: pointer;
  color: var(--text-muted);
  transition: all 0.15s;
  min-width: 68px;
}

.font-btn:hover { border-color: var(--accent); color: var(--accent); }
.font-btn.active { border-color: var(--accent); background: var(--accent-light); color: var(--text-primary); }

.font-preview-sample {
  font-size: 20px;
  font-weight: 600;
  line-height: 1;
}

.font-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-hint);
  font-family: inherit !important; /* label giữ font gốc để dễ đọc */
}

.font-btn .check-icon {
  position: absolute;
  top: 5px;
  right: 5px;
  font-size: 11px;
  color: var(--accent);
}

/* ── Font size slider ── */
.font-size-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.font-slider {
  flex: 1;
  accent-color: var(--accent);
  cursor: pointer;
}

.size-label {
  font-size: 12px;
  color: var(--text-hint);
  font-weight: 600;
  flex-shrink: 0;
}

.size-label.large { font-size: 20px; }

.font-size-value {
  font-size: 12px;
  font-weight: 700;
  color: var(--accent);
  background: var(--accent-light);
  padding: 2px 8px;
  border-radius: 6px;
  flex-shrink: 0;
}

.font-preview-text {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--bg-primary);
  border: 1px dashed var(--border);
  color: var(--text-muted);
  line-height: 1.5;
  transition: font-size 0.2s, font-family 0.2s;
}

/* ── Sound ── */
.volume-slider {
  width: 100%;
  accent-color: var(--accent);
  cursor: pointer;
  margin-top: 2px;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: var(--text-hint);
  margin-top: 4px;
}

.test-sound-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 7px;
  background: var(--accent-light);
  border: 1px solid var(--border);
  color: var(--accent);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.test-sound-btn:hover { background: var(--accent); color: var(--accent-text); }

/* ── Language ── */
.language-selector {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.lang-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px;
  border-radius: 10px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}

.flag { font-size: 16px; }
.lang-btn:hover { border-color: var(--accent); color: var(--accent); }
.lang-btn.active { background: var(--accent); border-color: var(--accent); color: var(--accent-text); }

/* ── Date format ── */
.date-format-group { display: flex; gap: 8px; }

.format-btn {
  padding: 7px 14px;
  border-radius: 8px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.format-btn:hover { border-color: var(--accent); color: var(--accent); }
.format-btn.active { background: var(--accent); border-color: var(--accent); color: var(--accent-text); }

/* ── Push permission ── */
.permission-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  flex-shrink: 0;
}

.permission-btn.granted { color: #16a34a; border-color: #16a34a; background: rgba(22,163,74,0.08); }
.permission-btn.denied  { color: var(--danger); border-color: var(--danger); background: var(--danger-bg); cursor: not-allowed; }

/* ── Quiet hours ── */
.time-range {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-subtle);
}

.time-field { display: flex; flex-direction: column; gap: 4px; }
.time-label { font-size: 11px; color: var(--text-hint); font-weight: 600; }

.time-input {
  padding: 7px 10px;
  border-radius: 8px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.time-input:focus { outline: none; border-color: var(--accent); }
.time-arrow { font-size: 14px; color: var(--text-hint); margin-top: 18px; }

/* ── Num input ── */
.num-wrap { display: flex; align-items: center; gap: 6px; }

.num-input {
  width: 70px;
  padding: 7px 10px;
  border-radius: 8px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 600;
  text-align: center;
  transition: border-color 0.15s;
}

.num-input:focus { outline: none; border-color: var(--accent); }
.num-unit { font-size: 12px; color: var(--text-hint); }

/* ── Severity filter ── */
.severity-filter-group { display: flex; gap: 8px; flex-wrap: wrap; }

.sev-btn {
  padding: 6px 14px;
  border-radius: 8px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  color: var(--text-muted);
}

.sev-btn:hover { border-color: var(--accent); }
.sev-btn.active { border-color: currentColor; }
.sev-all.active      { color: var(--accent); background: var(--accent-light); }
.sev-critical.active { color: #cf222e; background: rgba(207,34,46,0.08); }
.sev-error.active    { color: #b45309; background: rgba(180,83,9,0.08); }
.sev-warning.active  { color: #d97706; background: rgba(217,119,6,0.08); }

/* ── Shortcuts ── */
.shortcut-desc { font-size: 12px; color: var(--text-hint); margin-bottom: 4px; }

.shortcut-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}

.shortcut-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-secondary);
  gap: 16px;
}

.shortcut-row:last-child { border-bottom: none; }
.shortcut-label { font-size: 13px; color: var(--text-muted); }
.shortcut-keys { display: flex; gap: 4px; flex-shrink: 0; }

.kbd {
  padding: 2px 7px;
  border-radius: 5px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  font-size: 11px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-weight: 700;
  color: var(--text-muted);
  box-shadow: 0 1px 0 var(--border);
}

/* ── Version card ── */
.version-card { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }

.version-row {
  display: flex;
  justify-content: space-between;
  padding: 9px 14px;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-secondary);
}

.version-row:last-child { border-bottom: none; }
.version-label { font-size: 12px; color: var(--text-hint); font-weight: 600; }
.version-value { font-size: 12px; color: var(--text-muted); font-family: 'SF Mono', monospace; }
.status-ok { color: #16a34a !important; }

/* ── Account ── */
.account-info-card { display: flex; align-items: center; gap: 16px; }

.account-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--accent-light);
  color: var(--accent);
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 2px solid var(--border);
}

.account-meta { display: flex; flex-direction: column; gap: 4px; }
.account-name { font-size: 15px; font-weight: 700; color: var(--text-primary); }
.account-email { font-size: 12px; color: var(--text-hint); }

.role-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  width: fit-content;
}

.role-admin    { background: rgba(207,34,46,0.1);   color: #cf222e; }
.role-manager  { background: rgba(37,99,235,0.1);   color: #2563eb; }
.role-operator { background: rgba(22,163,74,0.1);   color: #16a34a; }
.role-viewer   { background: rgba(107,114,128,0.1); color: #6b7280; }

/* ── Password form ── */
.field-group { display: flex; flex-direction: column; gap: 10px; }
.field-item  { display: flex; flex-direction: column; gap: 4px; }
.field-label { font-size: 11px; font-weight: 600; color: var(--text-hint); }

.text-input {
  padding: 9px 12px;
  border-radius: 9px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  color: var(--text-primary);
  font-size: 13px;
  transition: border-color 0.15s;
}

.text-input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-light); }

.pw-error {
  font-size: 12px;
  color: var(--danger);
  padding: 6px 10px;
  background: var(--danger-bg);
  border-radius: 7px;
  border: 1px solid var(--danger);
}

.save-pw-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 16px;
  border-radius: 9px;
  background: var(--accent);
  border: none;
  color: var(--accent-text);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;
  width: fit-content;
}

.save-pw-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.save-pw-btn:not(:disabled):hover { opacity: 0.85; }

/* ── Danger zone ── */
.danger-card { border-color: var(--danger); background: var(--danger-bg); }

.danger-title {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 700;
  color: var(--danger);
  margin-bottom: 6px;
}

.danger-desc { font-size: 12px; color: var(--text-hint); margin-bottom: 12px; line-height: 1.5; }

.danger-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  border-radius: 9px;
  background: transparent;
  border: 1px solid var(--danger);
  color: var(--danger);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}

.danger-btn:hover { background: var(--danger-hover); }

/* ══════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════ */
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 24px;
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-secondary);
  flex-shrink: 0;
}

.unsaved-hint { font-size: 12px; color: var(--danger); font-weight: 600; margin-right: auto; }

.btn-cancel {
  padding: 8px 18px;
  border-radius: 9px;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-cancel:hover { background: var(--bg-tertiary); }

.btn-save {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 20px;
  border-radius: 9px;
  background: var(--accent);
  border: none;
  color: var(--accent-text);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;
}

.btn-save:disabled { opacity: 0.35; cursor: not-allowed; }
.btn-save:not(:disabled):hover { opacity: 0.85; }

/* ══════════════════════════════════════════════
   RESPONSIVE
══════════════════════════════════════════════ */
@media (max-width: 640px) {
  .settings-modal { max-width: 100%; max-height: 100vh; border-radius: 0; }
  .settings-nav { width: 56px; }
  .nav-item span, .user-info { display: none; }
  .nav-badge { position: absolute; top: 4px; right: 4px; }
  .settings-content { padding: 16px; }
}
</style>