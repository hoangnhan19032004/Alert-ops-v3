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
      <div class="modal-body">

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
            <span>{{ tab.label }}</span>
            <span v-if="tab.badge" class="nav-badge">{{ tab.badge }}</span>
          </button>

          <div class="nav-divider"></div>

          <div class="nav-user-card">
            <div class="user-avatar">{{ userInitials }}</div>
            <div class="user-info">
              <span class="user-name">{{ currentUser?.name || '—' }}</span>
              <span class="user-role">{{ currentUser?.role || '—' }}</span>
            </div>
          </div>
        </nav>

        <!-- Content panels -->
        <div class="settings-content">

          <!-- ── TAB: Appearance ── -->
          <div v-if="activeTab === 'appearance'" class="tab-panel">
            <div class="panel-title">Giao diện</div>

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
                  <span>{{ opt.label }}</span>
                </button>
              </div>
            </div>

            <!-- Compact view -->
            <div class="setting-card">
              <label class="toggle-row">
                <div>
                  <span class="label-text">{{ t('compactView') }}</span>
                  <span class="label-desc">{{ t('compactViewDesc') }}</span>
                </div>
                <div class="toggle-wrap">
                  <input v-model="preferences.compactView" type="checkbox" class="toggle-input" id="compact" />
                  <label for="compact" class="toggle-track"><span class="toggle-thumb"></span></label>
                </div>
              </label>
            </div>

            <!-- Sound notifications (new) -->
            <div class="setting-card">
              <label class="toggle-row">
                <div>
                  <span class="label-text">Âm thanh thông báo</span>
                  <span class="label-desc">Phát âm khi có alert mới hoặc critical</span>
                </div>
                <div class="toggle-wrap">
                  <input v-model="preferences.soundEnabled" type="checkbox" class="toggle-input" id="sound" />
                  <label for="sound" class="toggle-track"><span class="toggle-thumb"></span></label>
                </div>
              </label>
            </div>

            <!-- Sound volume (new, shown if sound on) -->
            <div v-if="preferences.soundEnabled" class="setting-card">
              <div class="card-label-row">
                <div>
                  <span class="label-text">Âm lượng</span>
                  <span class="label-desc">{{ preferences.soundVolume }}%</span>
                </div>
                <button class="test-sound-btn" @click="testSound">
                  <Icon name="lucide:volume-2" /> Test
                </button>
              </div>
              <input
                v-model.number="preferences.soundVolume"
                type="range" min="10" max="100" step="10"
                class="volume-slider"
              />
              <div class="slider-labels"><span>10%</span><span>100%</span></div>
            </div>

            <!-- Color accent (new) -->
            <div class="setting-card">
              <div class="card-label-row">
                <div>
                  <span class="label-text">Màu nhấn</span>
                  <span class="label-desc">Màu accent chính của giao diện</span>
                </div>
              </div>
              <div class="accent-grid">
                <button
                  v-for="c in accentColors"
                  :key="c.value"
                  class="accent-dot"
                  :class="{ active: preferences.accentColor === c.value }"
                  :style="{ background: c.hex }"
                  :title="c.label"
                  @click="preferences.accentColor = c.value"
                >
                  <Icon v-if="preferences.accentColor === c.value" name="lucide:check" class="check-icon" />
                </button>
              </div>
            </div>
          </div>

          <!-- ── TAB: Language & Region ── -->
          <div v-if="activeTab === 'language'" class="tab-panel">
            <div class="panel-title">Ngôn ngữ & Khu vực</div>

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

            <!-- Timezone (new) -->
            <div class="setting-card">
              <div class="card-label-row">
                <div>
                  <span class="label-text">Múi giờ</span>
                  <span class="label-desc">Ảnh hưởng đến thời gian hiển thị alert</span>
                </div>
              </div>
              <select v-model="preferences.timezone" class="select-input">
                <option v-for="tz in timezones" :key="tz.value" :value="tz.value">
                  {{ tz.label }}
                </option>
              </select>
            </div>

            <!-- Date format (new) -->
            <div class="setting-card">
              <div class="card-label-row">
                <div>
                  <span class="label-text">Định dạng ngày</span>
                  <span class="label-desc">Preview: {{ datePreview }}</span>
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
            <div class="panel-title">Thông báo</div>

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

            <!-- Notify only critical (new) -->
            <div class="setting-card">
              <label class="toggle-row">
                <div>
                  <span class="label-text">Chỉ thông báo Critical</span>
                  <span class="label-desc">Bỏ qua alert Warning và Info</span>
                </div>
                <div class="toggle-wrap">
                  <input v-model="preferences.criticalOnly" type="checkbox" class="toggle-input" id="critical-only" />
                  <label for="critical-only" class="toggle-track"><span class="toggle-thumb"></span></label>
                </div>
              </label>
            </div>

            <!-- Browser push (new) -->
            <div class="setting-card">
              <div class="toggle-row">
                <div>
                  <span class="label-text">Thông báo trình duyệt</span>
                  <span class="label-desc">Push notification khi tab không active</span>
                </div>
                <button
                  class="permission-btn"
                  :class="pushPermission"
                  @click="requestPushPermission"
                >
                  <Icon :name="pushIcon" />
                  {{ pushLabel }}
                </button>
              </div>
            </div>

            <!-- Quiet hours (new) -->
            <div class="setting-card">
              <label class="toggle-row">
                <div>
                  <span class="label-text">Giờ im lặng</span>
                  <span class="label-desc">Tắt thông báo trong khung giờ này</span>
                </div>
                <div class="toggle-wrap">
                  <input v-model="preferences.quietHours" type="checkbox" class="toggle-input" id="quiet" />
                  <label for="quiet" class="toggle-track"><span class="toggle-thumb"></span></label>
                </div>
              </label>
              <div v-if="preferences.quietHours" class="time-range">
                <div class="time-field">
                  <label class="time-label">Từ</label>
                  <input v-model="preferences.quietFrom" type="time" class="time-input" />
                </div>
                <Icon name="lucide:arrow-right" class="time-arrow" />
                <div class="time-field">
                  <label class="time-label">Đến</label>
                  <input v-model="preferences.quietTo" type="time" class="time-input" />
                </div>
              </div>
            </div>
          </div>

          <!-- ── TAB: Display ── -->
          <div v-if="activeTab === 'display'" class="tab-panel">
            <div class="panel-title">Hiển thị</div>

            <!-- Alerts per page -->
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

            <!-- Auto refresh -->
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
                  <span class="num-unit">s</span>
                </div>
              </div>
            </div>

            <!-- Default severity filter (new) -->
            <div class="setting-card">
              <div class="card-label-row">
                <div>
                  <span class="label-text">Bộ lọc mặc định</span>
                  <span class="label-desc">Severity hiển thị mặc định khi vào trang Alerts</span>
                </div>
              </div>
              <div class="severity-filter-group">
                <button
                  v-for="sev in severities"
                  :key="sev.value"
                  class="sev-btn"
                  :class="[sev.cls, { active: preferences.defaultSeverityFilter === sev.value }]"
                  @click="preferences.defaultSeverityFilter = sev.value"
                >{{ sev.label }}</button>
              </div>
            </div>

            <!-- Show resolved (new) -->
            <div class="setting-card">
              <label class="toggle-row">
                <div>
                  <span class="label-text">Hiện alert đã giải quyết</span>
                  <span class="label-desc">Mặc định ẩn các alert Resolved</span>
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
            <div class="panel-title">Phím tắt</div>
            <div class="shortcut-desc">Các phím tắt bàn phím hoạt động toàn app</div>

            <div class="shortcut-list">
              <div class="shortcut-row" v-for="s in shortcuts" :key="s.label">
                <span class="shortcut-label">{{ s.label }}</span>
                <div class="shortcut-keys">
                  <kbd v-for="k in s.keys" :key="k" class="kbd">{{ k }}</kbd>
                </div>
              </div>
            </div>

            <div class="panel-title" style="margin-top: 20px;">Phiên bản</div>
            <div class="version-card">
              <div class="version-row">
                <span class="version-label">App</span>
                <span class="version-value">AlertOps v3.0.0</span>
              </div>
              <div class="version-row">
                <span class="version-label">API</span>
                <span class="version-value status-ok">● Connected</span>
              </div>
              <div class="version-row">
                <span class="version-label">Build</span>
                <span class="version-value">{{ buildDate }}</span>
              </div>
            </div>
          </div>

          <!-- ── TAB: Account ── -->
          <div v-if="activeTab === 'account'" class="tab-panel">
            <div class="panel-title">Tài khoản</div>

            <div class="setting-card account-info-card">
              <div class="account-avatar">{{ userInitials }}</div>
              <div class="account-meta">
                <span class="account-name">{{ currentUser?.name || '—' }}</span>
                <span class="account-email">{{ currentUser?.email || '—' }}</span>
                <span class="role-badge" :class="`role-${currentUser?.role?.toLowerCase()}`">{{ currentUser?.role }}</span>
              </div>
            </div>

            <!-- Change password section -->
            <div class="setting-card">
              <div class="panel-title" style="font-size:13px; margin-bottom:12px;">Đổi mật khẩu</div>
              <div class="field-group">
                <div class="field-item">
                  <label class="field-label">Mật khẩu hiện tại</label>
                  <input v-model="pwForm.current" type="password" class="text-input" placeholder="••••••••" />
                </div>
                <div class="field-item">
                  <label class="field-label">Mật khẩu mới</label>
                  <input v-model="pwForm.next" type="password" class="text-input" placeholder="••••••••" />
                </div>
                <div class="field-item">
                  <label class="field-label">Xác nhận mật khẩu mới</label>
                  <input v-model="pwForm.confirm" type="password" class="text-input" placeholder="••••••••" />
                </div>
                <div v-if="pwError" class="pw-error">{{ pwError }}</div>
                <button class="save-pw-btn" @click="changePassword" :disabled="!canSavePassword">
                  <Icon name="lucide:shield-check" /> Cập nhật mật khẩu
                </button>
              </div>
            </div>

            <!-- Danger zone -->
            <div class="setting-card danger-card">
              <div class="danger-title">
                <Icon name="lucide:shield-alert" /> Vùng nguy hiểm
              </div>
              <div class="danger-desc">Khôi phục toàn bộ cài đặt về mặc định. Không ảnh hưởng dữ liệu alert.</div>
              <button class="danger-btn" @click="handleResetSettings">
                <Icon name="lucide:rotate-ccw" /> {{ t('resetToDefaults') }}
              </button>
            </div>
          </div>

        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <span class="unsaved-hint" v-if="hasChanges">● Có thay đổi chưa lưu</span>
        <button class="btn-cancel" @click="closeModal">{{ t('cancel') }}</button>
        <button class="btn-save" @click="saveSettings" :disabled="!hasChanges">
          <Icon name="lucide:save" /> {{ t('save') }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useUserPreferences } from '~/composables/useUserPreferences'
import { useToast } from '~/composables/useToast'
import { useTheme } from '~/composables/useTheme'
import { useI18n } from '~/composables/useI18n'
import { useAuth } from '~/composables/useAuth'

const emit = defineEmits<{ close: [] }>()

const { preferences: userPreferences, savePreferences, resetPreferences } = useUserPreferences()
const { success, info } = useToast()
const { setTheme } = useTheme()
const { t, setLanguage } = useI18n()
const { currentUser } = useAuth()

// ── Extended preferences with new fields ──
const preferences = ref({
  ...userPreferences.value,
  soundEnabled: false,
  soundVolume: 60,
  accentColor: 'blue',
  timezone: 'Asia/Ho_Chi_Minh',
  dateFormat: 'DD/MM/YYYY',
  criticalOnly: false,
  quietHours: false,
  quietFrom: '22:00',
  quietTo: '07:00',
  defaultSeverityFilter: 'all',
  showResolved: false,
})

const original = JSON.stringify(preferences.value)
const hasChanges = computed(() => JSON.stringify(preferences.value) !== original)

// ── Active tab ──
const activeTab = ref('appearance')

const tabs = computed(() => [
  { id: 'appearance',    label: 'Giao diện',  icon: 'lucide:palette' },
  { id: 'language',      label: 'Ngôn ngữ',   icon: 'lucide:globe' },
  { id: 'notifications', label: 'Thông báo',  icon: 'lucide:bell',   badge: notifBadge.value || undefined },
  { id: 'display',       label: 'Hiển thị',   icon: 'lucide:layout-grid' },
  { id: 'shortcuts',     label: 'Phím tắt',   icon: 'lucide:keyboard' },
  { id: 'account',       label: 'Tài khoản',  icon: 'lucide:user-circle' },
])

// Badge count notifications off
const notifBadge = computed(() => {
  let off = 0
  if (!preferences.value.emailNotifications) off++
  if (!preferences.value.slackNotifications) off++
  return off > 0 ? String(off) : ''
})

// ── User ──
const userInitials = computed(() => {
  const name = currentUser.value?.name || ''
  return name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase() || '?'
})

// ── Theme ──
const themeOptions = [
  { value: 'auto'  as const, label: 'Auto',  icon: 'lucide:monitor' },
  { value: 'light' as const, label: 'Light', icon: 'lucide:sun-medium' },
  { value: 'dark'  as const, label: 'Dark',  icon: 'lucide:moon-star' },
]

watch(() => preferences.value.theme, (v) => setTheme(v))
watch(() => preferences.value.language, (v) => setLanguage(v))

const selectLanguage = (lang: 'vi' | 'en') => {
  preferences.value.language = lang
  setLanguage(lang)
}

// ── Accent colors ──
const accentColors = [
  { value: 'blue',   hex: '#2563eb', label: 'Blue' },
  { value: 'violet', hex: '#7c3aed', label: 'Violet' },
  { value: 'teal',   hex: '#0d9488', label: 'Teal' },
  { value: 'rose',   hex: '#e11d48', label: 'Rose' },
  { value: 'amber',  hex: '#d97706', label: 'Amber' },
  { value: 'slate',  hex: '#475569', label: 'Slate' },
]

// ── Sound test ──
const testSound = () => {
  if (typeof window !== 'undefined' && window.AudioContext) {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 880
    gain.gain.setValueAtTime(preferences.value.soundVolume / 300, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    osc.start()
    osc.stop(ctx.currentTime + 0.4)
  }
}

// ── Timezone ──
const timezones = [
  { value: 'Asia/Ho_Chi_Minh', label: 'GMT+7 — Hồ Chí Minh' },
  { value: 'Asia/Bangkok',     label: 'GMT+7 — Bangkok' },
  { value: 'Asia/Singapore',   label: 'GMT+8 — Singapore' },
  { value: 'Asia/Tokyo',       label: 'GMT+9 — Tokyo' },
  { value: 'Europe/London',    label: 'GMT+0 — London' },
  { value: 'America/New_York', label: 'GMT-5 — New York' },
  { value: 'UTC',              label: 'UTC' },
]

// ── Date format ──
const dateFormats = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'YYYY-MM-DD', label: 'ISO 8601' },
]

const datePreview = computed(() => {
  const now = new Date()
  const d = String(now.getDate()).padStart(2, '0')
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const y = now.getFullYear()
  return preferences.value.dateFormat
    .replace('DD', d).replace('MM', m).replace('YYYY', String(y))
})

// ── Push notification ──
const pushPermission = ref(
  typeof Notification !== 'undefined' ? Notification.permission : 'default'
)

const pushIcon = computed(() => ({
  granted: 'lucide:check-circle',
  denied:  'lucide:x-circle',
  default: 'lucide:bell-plus',
}[pushPermission.value] || 'lucide:bell-plus'))

const pushLabel = computed(() => ({
  granted: 'Đã bật',
  denied:  'Bị chặn',
  default: 'Bật',
}[pushPermission.value] || 'Bật'))

const requestPushPermission = async () => {
  if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
    const result = await Notification.requestPermission()
    pushPermission.value = result
    if (result === 'granted') {
      new Notification('AlertOps', { body: 'Thông báo trình duyệt đã được bật!' })
    }
  }
}

// ── Severity filter ──
const severities = [
  { value: 'all',      label: 'Tất cả',  cls: 'sev-all' },
  { value: 'Critical', label: 'Critical', cls: 'sev-critical' },
  { value: 'Error',    label: 'Error',    cls: 'sev-error' },
  { value: 'Warning',  label: 'Warning',  cls: 'sev-warning' },
]

// ── Shortcuts reference ──
const shortcuts = [
  { label: 'Mở / Đóng Settings',     keys: ['G', 'S'] },
  { label: 'Tới trang Alerts',        keys: ['G', 'A'] },
  { label: 'Tới Dashboard',           keys: ['G', 'D'] },
  { label: 'Refresh alerts',          keys: ['R'] },
  { label: 'Tìm kiếm alert',          keys: ['Ctrl', 'K'] },
  { label: 'Đánh dấu alert đã chọn', keys: ['Space'] },
  { label: 'Xóa alert đã chọn',      keys: ['Delete'] },
  { label: 'Chọn tất cả alerts',     keys: ['Ctrl', 'A'] },
]

const buildDate = new Date().toLocaleDateString('vi-VN')

// ── Change password ──
const pwForm = ref({ current: '', next: '', confirm: '' })
const pwError = ref('')

const canSavePassword = computed(() =>
  pwForm.value.current.length > 0 &&
  pwForm.value.next.length >= 6 &&
  pwForm.value.next === pwForm.value.confirm
)

const changePassword = () => {
  pwError.value = ''
  if (pwForm.value.next !== pwForm.value.confirm) {
    pwError.value = 'Mật khẩu xác nhận không khớp'
    return
  }
  if (pwForm.value.next.length < 6) {
    pwError.value = 'Mật khẩu phải ít nhất 6 ký tự'
    return
  }
  // TODO: call API /api/auth/change-password
  success('Mật khẩu đã được cập nhật!')
  pwForm.value = { current: '', next: '', confirm: '' }
}

// ── Actions ──
const closeModal = () => emit('close')

const saveSettings = () => {
  savePreferences(preferences.value)
  setTheme(preferences.value.theme)
  setLanguage(preferences.value.language)
  success(t('settingsSaved'))
  closeModal()
}

const handleResetSettings = () => {
  if (confirm(t('confirmReset'))) {
    resetPreferences()
    preferences.value = { ...userPreferences.value } as any
    setLanguage(preferences.value.language)
    info(t('settingsReset'))
  }
}
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
   BODY: sidebar + content
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

.nav-icon {
  font-size: 15px;
  flex-shrink: 0;
}

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

.user-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  overflow: hidden;
}

.user-name {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 10px;
  color: var(--text-hint);
}

/* ── Content area ── */
.settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}

.tab-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

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

.setting-card:hover {
  border-color: var(--accent);
}

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

.toggle-wrap {
  flex-shrink: 0;
}

.toggle-input {
  display: none;
}

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

/* ── Accent colors ── */
.accent-grid {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.accent-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s, box-shadow 0.15s;
}

.accent-dot:hover { transform: scale(1.15); }
.accent-dot.active { border-color: var(--text-primary); box-shadow: 0 0 0 3px var(--bg-primary), 0 0 0 5px currentColor; }

.check-icon { font-size: 14px; color: #fff; }

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

/* ── Select ── */
.select-input {
  width: 100%;
  padding: 9px 12px;
  border-radius: 9px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
  transition: border-color 0.15s;
}

.select-input:focus { outline: none; border-color: var(--accent); }

/* ── Date format ── */
.date-format-group {
  display: flex;
  gap: 8px;
}

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

.time-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.time-label {
  font-size: 11px;
  color: var(--text-hint);
  font-weight: 600;
}

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
.severity-filter-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

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

.sev-all.active     { color: var(--accent); background: var(--accent-light); }
.sev-critical.active { color: #cf222e; background: rgba(207,34,46,0.08); }
.sev-error.active    { color: #b45309; background: rgba(180,83,9,0.08); }
.sev-warning.active  { color: #d97706; background: rgba(217,119,6,0.08); }

/* ── Shortcuts ── */
.shortcut-desc {
  font-size: 12px;
  color: var(--text-hint);
  margin-bottom: 4px;
}

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

.shortcut-label {
  font-size: 13px;
  color: var(--text-muted);
}

.shortcut-keys {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

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
.version-card {
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
}

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
.account-info-card {
  display: flex;
  align-items: center;
  gap: 16px;
}

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

.account-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.account-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}

.account-email {
  font-size: 12px;
  color: var(--text-hint);
}

.role-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  width: fit-content;
}

.role-admin    { background: rgba(207,34,46,0.1);  color: #cf222e; }
.role-manager  { background: rgba(37,99,235,0.1);  color: #2563eb; }
.role-operator { background: rgba(22,163,74,0.1);  color: #16a34a; }
.role-viewer   { background: rgba(107,114,128,0.1); color: #6b7280; }

/* ── Password form ── */
.field-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.field-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-hint);
}

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
.danger-card {
  border-color: var(--danger);
  background: var(--danger-bg);
}

.danger-title {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 700;
  color: var(--danger);
  margin-bottom: 6px;
}

.danger-desc {
  font-size: 12px;
  color: var(--text-hint);
  margin-bottom: 12px;
  line-height: 1.5;
}

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

.unsaved-hint {
  font-size: 12px;
  color: var(--danger);
  font-weight: 600;
  margin-right: auto;
}

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