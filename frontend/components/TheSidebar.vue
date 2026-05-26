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
      <!-- ✅ Avatar động theo tên user -->
      <div class="user-avatar">{{ userAvatar }}</div>
      <div class="user-info">
        <div class="user-name">{{ currentUser?.name ?? 'Unknown' }}</div>
        <!-- ✅ Role badge đổi màu theo role -->
        <div class="user-role" :class="roleClass">{{ currentUser?.role ?? '—' }}</div>
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
// import module
import { reactive, ref, computed, onMounted, onUnmounted } from 'vue'
import { useToast } from '~/composables/useToast'
import { useI18n } from '~/composables/useI18n'
import { useAuth } from '~/composables/useAuth'

const router = useRouter()

// ✅ Lấy currentUser từ useAuth
const { logout, currentUser } = useAuth()

// ✅ Avatar: 2 ký tự đầu của name
const userAvatar = computed(() => {
  const label = currentUser.value?.name ?? ''
  return label.slice(0, 2).toUpperCase() || '??'
})

// ✅ CSS class đổi màu theo role
const roleClass = computed(() => {
  switch (currentUser.value?.role) {
    case 'Admin':    return 'role-admin'
    case 'Manager':  return 'role-manager'
    case 'Operator': return 'role-operator'
    case 'Viewer':   return 'role-viewer'
    default:         return ''
  }
})

const menuItems = [
  { key: 'alerts',    to: '/alerts',    icon: 'lucide:bell' },
  { key: 'analytics', to: '/analytics', icon: 'lucide:bar-chart-3' },
  { key: 'projects',  to: '/projects',  icon: 'lucide:folder' },
  { key: 'escalation',to: '/escalation',icon: 'lucide:arrow-up-right' }
]

const notifications = reactive({
  alerts: 0,
  analytics: 0,
  projects: 0,
  escalation: 0
})

const { t } = useI18n()
const showSettings = ref(false)
const showSettingsModal = ref(false)
const { info } = useToast()

const toggleSettings = () => {
  showSettings.value = !showSettings.value
}

const handleProfile = () => {
  showSettings.value = false
  router.push('/profile')
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

.nav-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-item:hover {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  transform: translateX(2px);
}

.nav-item.router-link-active {
  background: var(--bg-secondary);
  color: var(--accent-color);
  font-weight: 600;
}

/* ===== BADGE ===== */
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
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 0 0 rgba(248, 81, 73, 0.7);
  animation: pulse 1.6s infinite;
}

.nav-item:hover .badge {
  transform: scale(1.1);
}

@keyframes pulse {
  0%   { box-shadow: 0 0 0 0 rgba(248, 81, 73, 0.6); }
  70%  { box-shadow: 0 0 0 6px rgba(248, 81, 73, 0); }
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
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ✅ Role base style */
.user-role {
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 999px;
  display: inline-block;
  margin-top: 2px;
}

/* ✅ Màu theo từng role */
.role-admin {
  background: rgba(248, 81, 73, 0.15);
  color: #f85149;
}

.role-manager {
  background: rgba(58, 123, 213, 0.15);
  color: #3a7bd5;
}

.role-operator {
  background: rgba(63, 185, 80, 0.15);
  color: #3fb950;
}

.role-viewer {
  background: rgba(139, 148, 158, 0.15);
  color: #8b949e;
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