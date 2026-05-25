<template>
  <div class="profile-page">
    <!-- Header -->
    <div class="profile-header">
      <button class="back-btn" @click="router.back()">
        <Icon name="lucide:arrow-left" />
      </button>
      <h1>{{ t('profile') }}</h1>
    </div>

    <!-- Main Layout: 2 cột -->
    <div class="profile-layout">

      <!-- CỘT TRÁI: Avatar + Actions -->
      <div class="col-left">
        <div class="avatar-card">
          <div class="avatar-wrapper">
            <img v-if="user?.avatar" :src="user.avatar" class="avatar" />
            <div v-else class="avatar-placeholder">{{ userInitials }}</div>
            <button class="avatar-edit-btn" @click="triggerAvatarUpload">
              <Icon name="lucide:camera" />
            </button>
            <input ref="avatarInput" type="file" accept="image/*" class="hidden" @change="handleAvatarChange" />
          </div>
          <h2 class="user-name">{{ user?.name || 'User' }}</h2>
          <p class="user-email">{{ user?.email }}</p>
          <div class="user-role-badge" :class="roleClass">{{ user?.role }}</div>
        </div>

        <!-- Actions -->
        <div class="action-card">
          <button class="action-row" @click="showPasswordModal = true">
            <div class="action-left">
              <Icon name="lucide:lock" />
              <span>{{ t('changePassword') }}</span>
            </div>
            <Icon name="lucide:chevron-right" />
          </button>
          <div class="action-divider"></div>
          <button class="action-row danger" @click="confirmDeleteAccount">
            <div class="action-left">
              <Icon name="lucide:trash-2" />
              <span>{{ t('deleteAccount') }}</span>
            </div>
            <Icon name="lucide:chevron-right" />
          </button>
        </div>

        <!-- Trạng thái lưu -->
        <div v-if="saveStatus" class="save-status" :class="saveStatus.type">
          <Icon :name="saveStatus.type === 'success' ? 'lucide:check-circle' : 'lucide:x-circle'" />
          <span>{{ saveStatus.message }}</span>
        </div>
      </div>

      <!-- CỘT PHẢI: Form -->
      <div class="col-right">
        <div class="form-card">
          <div class="form-title-row">
            <h2 class="form-title">{{ t('personalInfo') }}</h2>
            <span v-if="isDirty" class="unsaved-badge">Chưa lưu</span>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>{{ t('fullName') }}</label>
              <input v-model="form.name" type="text" :placeholder="t('fullName')" />
            </div>
            <div class="form-group">
              <label>{{ t('email') }}</label>
              <input v-model="form.email" type="email" disabled />
              <span class="field-note">{{ t('emailCannotChange') }}</span>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>{{ t('phone') }}</label>
              <input v-model="form.phone" type="tel" :placeholder="t('phone')" />
            </div>
            <div class="form-group">
              <!-- ô trống -->
            </div>
          </div>

          <div class="form-group full">
            <label>{{ t('bio') }}</label>
            <textarea v-model="form.bio" :placeholder="t('bioPlaceholder')" rows="4" />
          </div>

          <div class="form-footer">
            <button class="save-btn" :disabled="isSaving || !isDirty" @click="handleSave">
              <Icon v-if="isSaving" name="lucide:loader-circle" class="spin" />
              <Icon v-else-if="saveStatus?.type === 'success'" name="lucide:check" />
              <span>{{ isSaving ? t('saving') : t('saveChanges') }}</span>
            </button>
          </div>
        </div>
      </div>

    </div>

    <!-- Password Modal -->
    <Teleport to="body">
      <div v-if="showPasswordModal" class="modal-overlay" @click.self="showPasswordModal = false">
        <div class="modal">
          <h3>{{ t('changePassword') }}</h3>
          <div class="form-group">
            <label>{{ t('currentPassword') }}</label>
            <input v-model="passwordForm.current" type="password" />
          </div>
          <div class="form-group">
            <label>{{ t('newPassword') }}</label>
            <input v-model="passwordForm.new" type="password" />
          </div>
          <div class="form-group">
            <label>{{ t('confirmPassword') }}</label>
            <input v-model="passwordForm.confirm" type="password" />
          </div>
          <div class="modal-actions">
            <button class="btn-secondary" @click="showPasswordModal = false">{{ t('cancel') }}</button>
            <button class="btn-primary" @click="handleChangePassword">{{ t('confirm') }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { useI18n }  from '~/composables/useI18n'
import { useAuth }  from '~/composables/useAuth'
import { useApi }   from '~/composables/useApi'
import { useToast } from '~/composables/useToast'

definePageMeta({ layout: 'default' })

const { t }                 = useI18n()
const router                = useRouter()
const { currentUser: user } = useAuth()
const { apiCall }           = useApi()
const { success: toastSuccess, error: toastError } = useToast()

const avatarInput      = ref(null)
const isSaving         = ref(false)
const showPasswordModal = ref(false)
const saveStatus        = ref(null) // { type: 'success' | 'error', message: string }

// Lưu giá trị gốc để so sánh isDirty và reset
const original = {
  name:  user.value?.name  || '',
  phone: user.value?.phone || '',
  bio:   user.value?.bio   || '',
}

const form = reactive({
  name:  user.value?.name  || '',
  email: user.value?.email || '',
  phone: user.value?.phone || '',
  bio:   user.value?.bio   || '',
})

const passwordForm = reactive({
  current: '',
  new:     '',
  confirm: '',
})

// Phát hiện thay đổi chưa lưu
const isDirty = computed(() =>
  form.name  !== original.name  ||
  form.phone !== original.phone ||
  form.bio   !== original.bio
)

const userInitials = computed(() => {
  return (user.value?.name || 'U')
    .split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
})

const roleClass = computed(() => {
  switch (user.value?.role) {
    case 'Admin':    return 'role-admin'
    case 'Manager':  return 'role-manager'
    case 'Operator': return 'role-operator'
    case 'Viewer':   return 'role-viewer'
    default:         return ''
  }
})

function triggerAvatarUpload() { avatarInput.value?.click() }

async function handleAvatarChange(e) {
  const file = e.target.files[0]
  if (!file) return
}

// Reset về giá trị gốc
function resetForm() {
  form.name  = original.name
  form.phone = original.phone
  form.bio   = original.bio
  saveStatus.value = null
}

async function handleSave() {
  isSaving.value   = true
  saveStatus.value = null

  console.log('🔄 Đang gửi:', { name: form.name, phone: form.phone, bio: form.bio })

  try {
    const result = await apiCall('/api/auth/profile', {
      method: 'PUT',
      body: {
        name:  form.name,
        phone: form.phone,
        bio:   form.bio,
      }
    })

    console.log('📦 Kết quả:', result)

    if (result.success) {
      // Cập nhật original để isDirty = false
      original.name  = form.name
      original.phone = form.phone
      original.bio   = form.bio

      // Cập nhật state trong memory
      if (user.value) {
        user.value.name  = form.name
        user.value.phone = form.phone
        user.value.bio   = form.bio
      }

      // Cập nhật localStorage
      localStorage.setItem('alertops_user', JSON.stringify(user.value))

      saveStatus.value = { type: 'success', message: 'Đã lưu thành công' }
      toastSuccess('Cập nhật thành công')

      // Tắt badge sau 3 giây
      setTimeout(() => { saveStatus.value = null }, 3000)
    } else {
      console.error('❌ Lỗi API:', result)
      saveStatus.value = { type: 'error', message: result.message || 'Cập nhật thất bại' }
      toastError(result.message || 'Cập nhật thất bại')
    }
  } catch (err) {
    console.error('💥 Exception:', err)
    saveStatus.value = { type: 'error', message: 'Có lỗi xảy ra, thử lại sau' }
    toastError('Có lỗi xảy ra, thử lại sau')
  } finally {
    isSaving.value = false
  }
}

async function handleChangePassword() {
  if (passwordForm.new !== passwordForm.confirm) {
    toastError('Mật khẩu xác nhận không khớp')
    return
  }
  showPasswordModal.value = false
}

function confirmDeleteAccount() {}
</script>

<style scoped>
.profile-page {
  padding-bottom: 40px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  cursor: pointer;
  color: var(--text-tertiary);
  transition: all 0.15s;
}

.back-btn:hover {
  color: var(--text-primary);
  background: var(--bg-secondary);
}

.profile-header h1 {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.profile-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 20px;
  align-items: start;
}

.col-left {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.avatar-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.avatar-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  margin-bottom: 4px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3a7bd5, #6e40c9);
  color: #fff;
  font-size: 1.4rem;
  font-weight: 700;
}

.avatar-edit-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid var(--bg-primary);
  background: linear-gradient(135deg, #3a7bd5, #6e40c9);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  transition: opacity 0.15s;
}

.avatar-edit-btn:hover { opacity: 0.85; }

.user-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.user-email {
  font-size: 0.8rem;
  color: var(--text-tertiary);
  margin: 0;
  word-break: break-all;
}

.user-role-badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 999px;
  margin-top: 2px;
}

.role-admin    { background: rgba(248,81,73,.15);   color: var(--danger-color); }
.role-manager  { background: rgba(58,123,213,.15);  color: #3a7bd5; }
.role-operator { background: rgba(63,185,80,.15);   color: var(--success-color); }
.role-viewer   { background: rgba(139,148,158,.15); color: var(--text-tertiary); }

/* Trạng thái lưu ở cột trái */
.save-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 500;
  animation: fadeIn 0.2s ease;
}

.save-status.success {
  background: rgba(63,185,80,.12);
  color: var(--success-color);
  border: 1px solid rgba(63,185,80,.25);
}

.save-status.error {
  background: rgba(248,81,73,.12);
  color: var(--danger-color);
  border: 1px solid rgba(248,81,73,.25);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}

.action-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
}

.action-row {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 0.875rem;
  transition: background 0.15s;
}

.action-row:hover { background: var(--bg-secondary); }
.action-row.danger { color: var(--danger-color); }

.action-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-divider {
  height: 1px;
  background: var(--border-color);
}

.col-right {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.form-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

/* Badge "Chưa lưu" */
.unsaved-badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 999px;
  background: rgba(234,179,8,.15);
  color: #ca8a04;
  border: 1px solid rgba(234,179,8,.3);
  animation: pulse-badge 1.5s infinite;
}

@keyframes pulse-badge {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.6; }
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group.full {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.form-group input,
.form-group textarea {
  padding: 9px 12px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  font-size: 0.9rem;
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.15s;
  resize: none;
  font-family: inherit;
  width: 100%;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus { border-color: #3a7bd5; }
.form-group input:disabled  { opacity: 0.45; cursor: not-allowed; }

.field-note {
  font-size: 0.72rem;
  color: var(--text-tertiary);
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  padding-top: 4px;
  border-top: 1px solid var(--border-color);
}

.reset-btn {
  padding: 9px 16px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.reset-btn:hover    { background: var(--bg-primary); color: var(--text-primary); }
.reset-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.save-btn {
  padding: 9px 24px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #3a7bd5, #6e40c9);
  color: #fff;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 7px;
  transition: opacity 0.15s;
}

.save-btn:hover    { opacity: 0.9; }
.save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.hidden { display: none; }
.spin   { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  width: 100%;
  max-width: 380px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
}

.modal h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.modal-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.btn-secondary {
  flex: 1;
  padding: 9px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-secondary:hover { background: var(--bg-primary); }

.btn-primary {
  flex: 1;
  padding: 9px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #3a7bd5, #6e40c9);
  color: #fff;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary:hover { opacity: 0.9; }
</style>