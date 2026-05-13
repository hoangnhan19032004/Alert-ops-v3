<template>
  <aside class="sidebar">
    <div class="sidebar-brand">
      <div class="brand-icon">⚡</div>
      <div class="brand-text">
        <div class="brand-name">AlertOps</div>
        <div class="brand-sub">FPT Telecom</div>
      </div>
    </div>

    <nav class="sidebar-nav">
      <NuxtLink class="nav-item" to="/alerts">
        <div class="nav-content">
          <Icon name="lucide:bell" />
          <ClientOnly>{{ t('alerts') }}</ClientOnly>
        </div>
        <span v-if="notifications.alerts > 0" class="badge">{{ notifications.alerts }}</span>
      </NuxtLink>

      <NuxtLink class="nav-item" to="/analytics">
        <div class="nav-content">
          <Icon name="lucide:bar-chart-3" />
          <ClientOnly>{{ t('analytics') }}</ClientOnly>
        </div>
        <span v-if="notifications.analytics > 0" class="badge">{{ notifications.analytics }}</span>
      </NuxtLink>

      <NuxtLink class="nav-item" to="/projects">
        <div class="nav-content">
          <Icon name="lucide:folder" />
          <ClientOnly>{{ t('projects') }}</ClientOnly>
        </div>
        <span v-if="notifications.projects > 0" class="badge">{{ notifications.projects }}</span>
      </NuxtLink>

      <NuxtLink class="nav-item" to="/escalation">
        <div class="nav-content">
          <Icon name="lucide:arrow-up-right" />
          <ClientOnly>{{ t('escalation') }}</ClientOnly>
        </div>
        <span v-if="notifications.escalation > 0" class="badge">{{ notifications.escalation }}</span>
      </NuxtLink>
    </nav>

    <div class="sidebar-user">
      <div class="user-avatar">TN</div>
      <div class="user-info">
        <div class="user-name">trinm22</div>
        <div class="user-role">Manager</div>
      </div>
      <div class="settings-menu-container">
        <button class="settings-btn" aria-label="Settings" @click="toggleSettings">
          <Icon name="lucide:settings" />
        </button>
        <div v-if="showSettings" class="settings-menu">
          <button class="settings-menu-item" @click="handleProfile">
            <Icon name="lucide:user" />
            <ClientOnly><span>{{ t('profile') }}</span></ClientOnly>
          </button>
          <button class="settings-menu-item" @click="handlePreferences">
            <Icon name="lucide:sliders" />
            <ClientOnly><span>{{ t('preferences') }}</span></ClientOnly>
          </button>
          <div class="settings-menu-divider"></div>
          <button class="settings-menu-item logout" @click="handleLogout">
            <Icon name="lucide:log-out" />
            <ClientOnly><span>{{ t('logout') }}</span></ClientOnly>
          </button>
        </div>
      </div>
    </div>

    <SettingsModal v-if="showSettingsModal" @close="showSettingsModal = false" />
  </aside>
</template>

<script setup>
import { reactive, ref, onMounted, onUnmounted } from 'vue'
import { useToast } from '~/composables/useToast'
import { useI18n } from '~/composables/useI18n'
import { useAuth } from '~/composables/useAuth'

const router = useRouter()
const { logout } = useAuth()

// 👇 THÊM Ở ĐÂY
const menuItems = [
  { key: 'alerts', to: '/alerts', icon: 'lucide:bell' },
  { key: 'analytics', to: '/analytics', icon: 'lucide:bar-chart-3' },
  { key: 'projects', to: '/projects', icon: 'lucide:folder' },
  { key: 'escalation', to: '/escalation', icon: 'lucide:arrow-up-right' }
]

// 👇 State notification
const notifications = reactive({
  alerts: 0,
  analytics: 0,
  projects: 0,
  escalation: 0
})

const { t } = useI18n()
const showSettings = ref(false)
const showSettingsModal = ref(false)
const { success, info } = useToast()

const toggleSettings = () => {
  showSettings.value = !showSettings.value
}

const handleProfile = () => {
  info(t('profileComingSoon'))
  showSettings.value = false
}

const handlePreferences = () => {
  showSettingsModal.value = true
  showSettings.value = false
}

const handleLogout = () => {
  router.push('/logout')
  showSettings.value = false
}

const handleClickOutside = (event) => {
  const settingsContainer = document.querySelector('.settings-menu-container')
  if (settingsContainer && !settingsContainer.contains(event.target)) {
    showSettings.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* ===== SIDEBAR ===== */
.sidebar {
  width: 220px;
  min-width: 220px;
  background: var(--bg-primary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* ===== BRAND ===== */
.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 16px;
  border-bottom: 1px solid var(--border-color);
}

.brand-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #6e40c9, #3a7bd5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 14px;
  color: #fff;
}

.brand-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}

.brand-sub {
  font-size: 11px;
  color: var(--text-tertiary);
}

/* ===== NAV ===== */
.sidebar-nav {
  padding: 10px 8px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-tertiary);
  font-size: 14px;
  text-decoration: none;
  transition: all 0.2s ease;
  margin-bottom: 4px;
}

/* icon + text */
.nav-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* hover */
.nav-item:hover {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  transform: translateX(2px);
}

/* active */
.nav-item.router-link-active {
  background: var(--bg-secondary);
  color: var(--accent-color);
  font-weight: 600;
}

/* ===== BADGE (UPDATED 🔥) ===== */
.badge {
  background: #f85149;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  min-width: 18px;
  height: 18px;
  padding: 0 6px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;

  /* smooth */
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

/* hover effect */
.nav-item:hover .badge {
  transform: scale(1.1);
}

/* optional: pulse khi có alert */
.badge {
  box-shadow: 0 0 0 rgba(248, 81, 73, 0.7);
  animation: pulse 1.6s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(248, 81, 73, 0.6); }
  70% { box-shadow: 0 0 0 6px rgba(248, 81, 73, 0); }
  100% { box-shadow: 0 0 0 0 rgba(248, 81, 73, 0); }
}

/* ===== USER ===== */
.sidebar-user {
  padding: 14px 12px;
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3a7bd5, #6e40c9);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.user-role {
  font-size: 11px;
  color: var(--text-tertiary);
}

.user-info {
  flex: 1;
}

/* ===== SETTINGS ===== */
.settings-btn {
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
}

.settings-btn:hover {
  color: var(--text-secondary);
}

/* dropdown */
.settings-menu-container {
  position: relative;
}

.settings-menu {
  position: absolute;
  bottom: 100%;
  right: 0;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.35);
  min-width: 160px;
  margin-bottom: 8px;
  z-index: 1000;
  animation: slideUp 0.2s ease-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.settings-menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  font-size: 13px;
  transition: all 0.15s;
}

.settings-menu-item:hover {
  background: var(--bg-primary);
  color: var(--text-secondary);
}

.settings-menu-item.logout:hover {
  color: #f85149;
}

.settings-menu-divider {
  height: 1px;
  background: var(--border-color);
  margin: 6px 0;
}
</style>
