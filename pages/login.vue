<template>
  <div class="login-root">
    <!-- Background grid -->
    <div class="bg-grid" aria-hidden="true"></div>
    <!-- Glow blobs -->
    <div class="blob blob-1" aria-hidden="true"></div>
    <div class="blob blob-2" aria-hidden="true"></div>

    <div class="login-wrap">
      <!-- Brand -->
      <div class="brand">
        <div class="brand-icon">⚡</div>
        <div class="brand-text">
          <span class="brand-name">AlertOps</span>
          <span class="brand-sub">FPT Telecom · NOC Platform</span>
        </div>
      </div>

      <!-- Card -->
      <div class="login-card" :class="{ shake: shaking }">
        <div class="card-header">
          <h1 class="card-title">Đăng nhập</h1>
          <p class="card-desc">Nhập thông tin tài khoản của bạn</p>
        </div>

        <form class="login-form" @submit.prevent="handleLogin">
          <!-- Username -->
          <div class="field">
            <label class="field-label" for="username">Tên đăng nhập</label>
            <div class="input-wrap" :class="{ focused: focusedField === 'username', error: !!authError }">
              <Icon name="lucide:user" class="input-icon" />
              <input
                id="username"
                v-model="form.username"
                type="text"
                class="field-input"
                placeholder="Nhập username..."
                autocomplete="username"
                :disabled="isLoading"
                @focus="focusedField = 'username'"
                @blur="focusedField = ''"
                @input="clearError"
              />
            </div>
          </div>

          <!-- Password -->
          <div class="field">
            <label class="field-label" for="password">Mật khẩu</label>
            <div class="input-wrap" :class="{ focused: focusedField === 'password', error: !!authError }">
              <Icon name="lucide:lock" class="input-icon" />
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="field-input"
                placeholder="Nhập mật khẩu..."
                autocomplete="current-password"
                :disabled="isLoading"
                @focus="focusedField = 'password'"
                @blur="focusedField = ''"
                @input="clearError"
              />
              <button
                type="button"
                class="eye-btn"
                :aria-label="showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
                @click="showPassword = !showPassword"
              >
                <Icon :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'" />
              </button>
            </div>
          </div>

          <!-- Error message -->
          <transition name="err-fade">
            <div v-if="authError" class="error-msg">
              <Icon name="lucide:alert-triangle" />
              <span>{{ authError }}</span>
            </div>
          </transition>

          <!-- Submit -->
          <button
            type="submit"
            class="submit-btn"
            :class="{ loading: isLoading }"
            :disabled="isLoading || !form.username || !form.password"
          >
            <span v-if="!isLoading" class="btn-content">
              <Icon name="lucide:log-in" />
              Đăng nhập
            </span>
            <span v-else class="btn-content">
              <Icon name="lucide:loader-2" class="spin" />
              Đang xác thực...
            </span>
          </button>
        </form>

        <!-- Demo hint -->
        <div class="demo-hint">
          <span class="hint-label">Demo accounts</span>
          <div class="hint-list">
            <button
              v-for="demo in demoAccounts"
              :key="demo.user"
              class="hint-chip"
              :class="`role-${demo.role.toLowerCase()}`"
              type="button"
              :disabled="isLoading"
              @click="fillDemo(demo)"
            >
              <span class="chip-avatar">{{ demo.avatar }}</span>
              <span class="chip-info">
                <span class="chip-user">{{ demo.user }}</span>
                <span class="chip-role">{{ demo.role }}</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <p class="login-footer">© 2026 FPT Telecom · AlertOps v3</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useTheme } from '~/composables/useTheme'

definePageMeta({ layout: 'blank' })

const { login, isLoading, authError, clearError, isAuthenticated, restoreSession } = useAuth()
useTheme()

const router = useRouter()

const form = reactive({ username: '', password: '' })
const showPassword = ref(false)
const focusedField = ref('')
const shaking = ref(false)

const demoAccounts = [
  { user: 'trinm22', password: 'fpt123',   role: 'Manager', avatar: 'TN' }
]

onMounted(() => {
  restoreSession()
  if (isAuthenticated.value) router.replace('/alerts')
})

const fillDemo = (demo: typeof demoAccounts[0]) => {
  form.username = demo.user
  form.password = demo.password
  clearError()
}

const triggerShake = () => {
  shaking.value = true
  setTimeout(() => { shaking.value = false }, 500)
}

const handleLogin = async () => {
  if (!form.username || !form.password) return
  const ok = await login(form.username, form.password)
  if (ok) {
    router.replace('/alerts')
  } else {
    triggerShake()
  }
}
</script>

<style scoped>
/* ── Root ── */
.login-root {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-page);
  position: relative;
  overflow: hidden;
}

/* ── Background grid ── */
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

/* ── Glow blobs ── */
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  opacity: 0.12;
}
.blob-1 {
  width: 500px; height: 500px;
  top: -120px; left: -120px;
  background: radial-gradient(circle, #6e40c9, transparent 70%);
  animation: drift 12s ease-in-out infinite alternate;
}
.blob-2 {
  width: 400px; height: 400px;
  bottom: -80px; right: -80px;
  background: radial-gradient(circle, #3a7bd5, transparent 70%);
  animation: drift 15s ease-in-out infinite alternate-reverse;
}
@keyframes drift {
  from { transform: translate(0, 0) scale(1); }
  to   { transform: translate(30px, 20px) scale(1.05); }
}

/* ── Wrap ── */
.login-wrap {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  width: 100%;
  max-width: 420px;
  padding: 24px 16px;
  animation: fadeUp 0.5s ease-out both;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Brand ── */
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}
.brand-icon {
  width: 48px; height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, #6e40c9 0%, #3a7bd5 100%);
  display: flex; align-items: center; justify-content: center;
  font-size: 22px;
  box-shadow: 0 8px 24px rgba(110, 64, 201, 0.35);
}
.brand-name {
  display: block;
  font-size: 22px; font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.5px;
}
.brand-sub {
  display: block;
  font-size: 11px;
  color: var(--text-tertiary);
  margin-top: 1px;
  letter-spacing: 0.3px;
}

/* ── Card ── */
.login-card {
  width: 100%;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  transition: border-color 0.2s;
}
.login-card:hover {
  border-color: var(--text-tertiary);
}

/* Shake animation on wrong creds */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%       { transform: translateX(-8px); }
  40%       { transform: translateX(8px); }
  60%       { transform: translateX(-5px); }
  80%       { transform: translateX(5px); }
}
.login-card.shake { animation: shake 0.45s ease-out; }

.card-header { margin-bottom: 24px; }
.card-title { font-size: 20px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; }
.card-desc  { font-size: 13px; color: var(--text-tertiary); }

/* ── Form ── */
.login-form { display: flex; flex-direction: column; gap: 16px; }

.field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 12px; font-weight: 600; color: var(--text-secondary); letter-spacing: 0.2px; }

.input-wrap {
  display: flex;
  align-items: center;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  transition: border-color 0.15s, box-shadow 0.15s;
  overflow: hidden;
}
.input-wrap.focused {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-color) 15%, transparent);
}
.input-wrap.error {
  border-color: #f85149;
  box-shadow: 0 0 0 3px rgba(248, 81, 73, 0.12);
}

.input-icon {
  padding: 0 12px;
  color: var(--text-tertiary);
  font-size: 15px;
  flex-shrink: 0;
  transition: color 0.15s;
}
.input-wrap.focused .input-icon { color: var(--accent-color); }

.field-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  padding: 11px 4px 11px 0;
  font-size: 14px;
  color: var(--text-primary);
  font-family: inherit;
}
.field-input::placeholder { color: var(--text-tertiary); }
.field-input:disabled { opacity: 0.6; cursor: not-allowed; }

.eye-btn {
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: 0 12px;
  display: flex;
  align-items: center;
  transition: color 0.15s;
}
.eye-btn:hover { color: var(--text-secondary); }

/* ── Error ── */
.error-msg {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(248, 81, 73, 0.1);
  border: 1px solid rgba(248, 81, 73, 0.25);
  border-radius: 7px;
  color: #f85149;
  font-size: 13px;
}
.err-fade-enter-active, .err-fade-leave-active { transition: all 0.25s ease; }
.err-fade-enter-from, .err-fade-leave-to { opacity: 0; transform: translateY(-4px); }

/* ── Submit ── */
.submit-btn {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #6e40c9 0%, #3a7bd5 100%);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.15s, box-shadow 0.15s;
  box-shadow: 0 4px 16px rgba(110, 64, 201, 0.3);
  margin-top: 4px;
}
.submit-btn:hover:not(:disabled) {
  opacity: 0.92;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(110, 64, 201, 0.4);
}
.submit-btn:active:not(:disabled) { transform: translateY(0); }
.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}
.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Demo hint ── */
.demo-hint {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}
.hint-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin-bottom: 10px;
}
.hint-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.hint-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
  width: 100%;
}
.hint-chip:hover:not(:disabled) {
  border-color: var(--accent-color);
  background: color-mix(in srgb, var(--accent-color) 6%, var(--bg-tertiary));
}
.hint-chip:disabled { opacity: 0.5; cursor: not-allowed; }

.chip-avatar {
  width: 30px; height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3a7bd5, #6e40c9);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; color: #fff;
  flex-shrink: 0;
}
.role-manager  .chip-avatar { background: linear-gradient(135deg, #3a7bd5, #6e40c9); }
.chip-info { display: flex; flex-direction: column; gap: 1px; }
.chip-user { font-size: 13px; font-weight: 600; color: var(--text-primary); font-family: 'Courier New', monospace; }
.chip-role { font-size: 11px; color: var(--text-tertiary); }

/* ── Footer ── */
.login-footer {
  font-size: 11px;
  color: var(--text-tertiary);
  text-align: center;
}
</style>
