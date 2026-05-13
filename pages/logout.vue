<template>
  <div class="logout-root">
    <div class="bg-grid" aria-hidden="true"></div>
    <div class="blob blob-1" aria-hidden="true"></div>
    <div class="blob blob-2" aria-hidden="true"></div>

    <div class="logout-wrap">
      <!-- Brand -->
      <div class="brand">
        <div class="brand-icon">⚡</div>
        <span class="brand-name">AlertOps</span>
      </div>

      <!-- Card -->
      <div class="logout-card">
        <transition name="slide" mode="out-in">
          <!-- State: confirming -->
          <div v-if="state === 'confirm'" key="confirm" class="card-inner">
            <div class="user-info">
              <div class="user-avatar" :class="`av-${currentUser?.role?.toLowerCase()}`">
                {{ currentUser?.avatar }}
              </div>
              <div>
                <div class="user-name">{{ currentUser?.fullName }}</div>
                <div class="user-meta">{{ currentUser?.username }} · {{ currentUser?.role }}</div>
              </div>
            </div>
            
            <div class="confirm-icon">⚠️</div>
            <h2 class="confirm-title">Đăng xuất?</h2>
            <p class="confirm-desc">
              Bạn có chắc muốn đăng xuất khỏi hệ thống?<br />
              Mọi phiên làm việc sẽ được kết thúc.
            </p>

            <div class="btn-row">
              <button class="btn-cancel" @click="goBack">
                <Icon name="lucide:arrow-left" />
                Quay lại
              </button>
              <button class="btn-logout" @click="handleLogout">
                <Icon name="lucide:log-out" />
                Đăng xuất
              </button>
            </div>
          </div>

          <!-- State: logging out -->
          <div v-else-if="state === 'loading'" key="loading" class="card-inner card-center">
            <div class="loading-ring">
              <svg viewBox="0 0 50 50"><circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="80 40" /></svg>
            </div>
            <p class="loading-text">Đang đăng xuất...</p>
          </div>

          <!-- State: done -->
          <div v-else-if="state === 'done'" key="done" class="card-inner card-center">
            <div class="done-icon">✓</div>
            <h2 class="done-title">Đã đăng xuất</h2>
            <p class="done-desc">Chuyển về trang đăng nhập...</p>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: progress + '%' }"></div>
            </div>
          </div>
        </transition>
      </div>

      <p class="footer-text">© 2026 FPT Telecom · AlertOps v3</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useTheme } from '~/composables/useTheme'

definePageMeta({ layout: 'blank' })

const { currentUser, logout, isAuthenticated, restoreSession } = useAuth()
useTheme()
const router = useRouter()

const state = ref<'confirm' | 'loading' | 'done'>('confirm')
const progress = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  restoreSession()
  // If not logged in, redirect immediately
  if (!isAuthenticated.value) router.replace('/login')
})

onUnmounted(() => { if (timer) clearInterval(timer) })

const goBack = () => router.back()

const handleLogout = async () => {
  state.value = 'loading'
  await new Promise(r => setTimeout(r, 800))

  logout()
  state.value = 'done'

  // Progress bar countdown then redirect
  let p = 0
  timer = setInterval(() => {
    p += 4
    progress.value = p
    if (p >= 100) {
      clearInterval(timer!)
      router.replace('/login')
    }
  }, 100)
}
</script>

<style scoped>
/* ── Root ── */
.logout-root {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-page);
  position: relative;
  overflow: hidden;
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--border-color) 1px, transparent 1px),
    linear-gradient(90deg, var(--border-color) 1px, transparent 1px);
  background-size: 40px 40px;
  opacity: 0.4;
  pointer-events: none;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  opacity: 0.1;
}
.blob-1 {
  width: 400px; height: 400px;
  top: -80px; right: -80px;
  background: radial-gradient(circle, #f85149, transparent 70%);
  animation: drift 10s ease-in-out infinite alternate;
}
.blob-2 {
  width: 350px; height: 350px;
  bottom: -60px; left: -60px;
  background: radial-gradient(circle, #6e40c9, transparent 70%);
  animation: drift 14s ease-in-out infinite alternate-reverse;
}
@keyframes drift {
  from { transform: translate(0, 0); }
  to   { transform: translate(25px, 15px); }
}

/* ── Wrap ── */
.logout-wrap {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
  max-width: 400px;
  padding: 24px 16px;
  animation: fadeUp 0.4s ease-out both;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Brand ── */
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}
.brand-icon {
  width: 40px; height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #6e40c9, #3a7bd5);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
  box-shadow: 0 6px 18px rgba(110, 64, 201, 0.3);
}
.brand-name {
  font-size: 20px; font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.5px;
}

/* ── Card ── */
.logout-card {
  width: 100%;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  min-height: 280px;
  display: flex;
  align-items: stretch;
}

.card-inner {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.card-center {
  align-items: center;
  justify-content: center;
  gap: 12px;
}

/* ── User info ── */
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-tertiary);
  border-radius: 10px;
  border: 1px solid var(--border-color);
}
.user-avatar {
  width: 40px; height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3a7bd5, #6e40c9);
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700; color: #fff;
  flex-shrink: 0;
}
.av-manager { background: linear-gradient(135deg, #3a7bd5, #6e40c9) !important; }
.user-name { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.user-meta { font-size: 11px; color: var(--text-tertiary); margin-top: 1px; }

/* ── Confirm ── */
.confirm-icon { font-size: 36px; text-align: center; margin-top: 4px; }
.confirm-title { font-size: 18px; font-weight: 700; color: var(--text-primary); text-align: center; }
.confirm-desc  { font-size: 13px; color: var(--text-tertiary); text-align: center; line-height: 1.6; }

.btn-row {
  display: flex;
  gap: 10px;
  margin-top: 4px;
}
.btn-cancel, .btn-logout {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 11px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-cancel {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
}
.btn-cancel:hover {
  border-color: var(--text-tertiary);
  color: var(--text-primary);
}
.btn-logout {
  background: linear-gradient(135deg, #da3633, #b91c1c);
  border: 1px solid #da3633;
  color: #fff;
  box-shadow: 0 4px 14px rgba(218, 54, 51, 0.3);
}
.btn-logout:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(218, 54, 51, 0.4);
}

/* ── Loading ── */
.loading-ring {
  width: 52px; height: 52px;
  color: var(--accent-color);
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.loading-text {
  font-size: 14px;
  color: var(--text-secondary);
}

/* ── Done ── */
.done-icon {
  width: 56px; height: 56px;
  border-radius: 50%;
  background: rgba(63, 185, 80, 0.15);
  border: 2px solid #3fb950;
  color: #3fb950;
  font-size: 22px;
  display: flex; align-items: center; justify-content: center;
  animation: popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
@keyframes popIn {
  from { opacity: 0; transform: scale(0.5); }
  to   { opacity: 1; transform: scale(1); }
}
.done-title { font-size: 18px; font-weight: 700; color: var(--text-primary); }
.done-desc  { font-size: 13px; color: var(--text-tertiary); }

.progress-bar {
  width: 100%;
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 4px;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6e40c9, #3a7bd5);
  border-radius: 2px;
  transition: width 0.1s linear;
}

/* ── Transitions ── */
.slide-enter-active, .slide-leave-active {
  transition: all 0.25s ease;
}
.slide-enter-from { opacity: 0; transform: translateX(20px); }
.slide-leave-to  { opacity: 0; transform: translateX(-20px); }

/* ── Footer ── */
.footer-text {
  font-size: 11px;
  color: var(--text-tertiary);
  text-align: center;
}
</style>
