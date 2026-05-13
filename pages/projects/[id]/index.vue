<template>
  <div class="page-wrap">
    <!-- Back -->
    <button class="back-btn" @click="router.push('/projects')">
      <Icon name="lucide:arrow-left" />
      {{ t('backToProjects') }}
    </button>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <Icon name="lucide:loader-2" class="loading-icon" />
      <p>{{ t('loadingProject') }}</p>
    </div>

    <!-- Content -->
    <template v-else-if="project">
      <!-- Header -->
      <div class="proj-header">
        <div>
          <div class="proj-title-row">
            <h1 class="proj-title">{{ project.name }}</h1>
            <span class="badge" :class="badgeClass(project.sev)">
              <span class="badge-dot"></span>
              {{ project.sev }}
            </span>
          </div>
          <p class="proj-desc">{{ project.desc || t('noDescription') }}</p>
        </div>

        <div class="proj-header-actions">
          <button class="btn-secondary" @click="router.push(`${route.path}/edit`)">
            <Icon name="lucide:pencil" />
            {{ t('edit') }}
          </button>
          <button class="btn-danger" @click="showDeleteModal = true">
            <Icon name="lucide:trash-2" />
            {{ t('delete') }}
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon icon-alert"><Icon name="lucide:bell" /></div>
          <div>
            <div class="stat-val">{{ project.alertCount || 0 }}</div>
            <div class="stat-label">{{ t('totalAlerts') }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon icon-member"><Icon name="lucide:users" /></div>
          <div>
            <div class="stat-val">{{ totalMembers }}</div>
            <div class="stat-label">{{ t('members') }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon icon-resolve"><Icon name="lucide:check-circle" /></div>
          <div>
            <div class="stat-val">{{ resolvedCount }}</div>
            <div class="stat-label">{{ t('resolved') }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon icon-open"><Icon name="lucide:alert-circle" /></div>
          <div>
            <div class="stat-val">{{ openCount }}</div>
            <div class="stat-label">{{ t('open') }}</div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="content-grid">
        <!-- Left col: Alerts + Mail -->
        <div class="left-col">
          <!-- Alerts -->
          <div class="section-card">
            <div class="section-header">
              <h2 class="section-title">
                <Icon name="lucide:bell" />
                {{ t('alerts') }}
              </h2>
              <div class="section-header-right">
                <span class="count-badge">{{ projectAlerts.length }}</span>
                <button class="view-all-btn" @click="router.push(`/alerts?projectId=${project.id}`)">
                  <Icon name="lucide:external-link" />
                  {{ t('viewAll') }}
                </button>
              </div>
            </div>

            <div v-if="alertsLoading" class="mini-loading">
              <Icon name="lucide:loader-2" class="loading-icon" />
            </div>
            <div v-else-if="projectAlerts.length === 0" class="empty-state">
              <Icon name="lucide:check-circle-2" />
              <p>{{ t('noAlerts') }}</p>
            </div>
            <div v-else class="alerts-list">
              <div v-for="a in projectAlerts" :key="a.id" class="alert-row">
                <div class="alert-row-left">
                  <span class="alert-sev-dot" :class="dotClass(a.severity)"></span>
                  <div>
                    <div class="alert-msg">{{ a.title || a.message }}</div>
                    <div class="alert-meta">{{ a.severity }} · {{ formatTime(a.createdAt) }}</div>
                  </div>
                </div>
                <span class="alert-status" :class="statusClass(a.status)">{{ a.status }}</span>
              </div>
            </div>
          </div>

          <!-- ─── Mail History ─── -->
          <div class="section-card">
            <div class="section-header">
              <h2 class="section-title">
                <Icon name="lucide:mail" />
                Lịch sử gửi mail
              </h2>
              <div class="section-header-right">
                <span class="count-badge">{{ mailHistory.length }}</span>
                <button class="view-all-btn compose-trigger" @click="showComposeModal = true">
                  <Icon name="lucide:send" />
                  Gửi mail
                </button>
              </div>
            </div>

            <div v-if="mailLoading" class="mini-loading">
              <Icon name="lucide:loader-2" class="loading-icon" />
            </div>

            <div v-else-if="mailHistory.length === 0" class="empty-state">
              <Icon name="lucide:mail-x" />
              <p>Chưa có mail nào được gửi</p>
            </div>

            <div v-else class="mail-list">
              <div
                v-for="mail in mailHistory"
                :key="mail.id"
                class="mail-item"
                :class="{ expanded: expandedMailId === mail.id }"
                @click="toggleMail(mail.id)"
              >
                <!-- Mail header row -->
                <div class="mail-item-header">
                  <div class="mail-dot" :class="mail.type === 'auto' ? 'dot-auto' : 'dot-manual'"></div>
                  <div class="mail-item-info">
                    <div class="mail-subject">{{ mail.subject }}</div>
                    <div class="mail-meta-row">
                      <span class="mail-tag" :class="mail.type === 'auto' ? 'tag-auto' : 'tag-manual'">
                        {{ mail.type === 'auto' ? 'Tự động' : 'Thủ công' }}
                      </span>
                      <span class="mail-status-dot">●</span>
                      <span class="mail-sent-status">{{ mail.status === 'sent' ? 'Đã gửi' : mail.status === 'failed' ? 'Thất bại' : 'Đang xử lý' }}</span>
                    </div>
                  </div>
                  <div class="mail-item-right">
                    <span class="mail-time">{{ formatTime(mail.sentAt || mail.createdAt) }}</span>
                    <Icon
                      :name="expandedMailId === mail.id ? 'lucide:chevron-up' : 'lucide:chevron-down'"
                      class="mail-chevron"
                    />
                  </div>
                </div>

                <!-- Expanded content -->
                <div v-if="expandedMailId === mail.id" class="mail-item-body">
                  <div class="mail-detail-row">
                    <span class="mail-detail-label">ĐẾN</span>
                    <div class="mail-recipients">
                      <span v-for="r in mail.recipients" :key="r" class="recipient-tag">{{ r }}</span>
                    </div>
                  </div>
                  <div class="mail-detail-row">
                    <span class="mail-detail-label">NỘI DUNG</span>
                    <p class="mail-body-text">{{ mail.body }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right col -->
        <div class="right-col">
          <!-- Members -->
          <div class="section-card">
            <div class="section-header">
              <h2 class="section-title"><Icon name="lucide:users" />{{ t('members') }}</h2>
            </div>
            <div class="members-list">
              <template v-if="project.owner">
                <div class="member-group-title">{{ t('owner') }}</div>
                <div class="member-row">
                  <div class="avatar-lg av-owner">{{ initials(project.owner.name) }}</div>
                  <div class="member-content">
                    <div class="member-name">{{ project.owner.name }}</div>
                    <div class="member-role">{{ project.owner.email }}</div>
                  </div>
                </div>
              </template>
              <template v-if="project.managers?.length">
                <div class="member-group-title">{{ t('managers') }}</div>
                <div v-for="m in project.managers" :key="m.email" class="member-row">
                  <div class="avatar-lg av-manager">{{ initials(m.name) }}</div>
                  <div class="member-content">
                    <div class="member-name">{{ m.name }}</div>
                    <div class="member-role">{{ m.email }}</div>
                  </div>
                </div>
              </template>
              <template v-if="project.members?.length">
                <div class="member-group-title">{{ t('teamMembers') }}</div>
                <div v-for="m in project.members" :key="m.email" class="member-row">
                  <div class="avatar-lg av-member">{{ initials(m.name) }}</div>
                  <div class="member-content">
                    <div class="member-name">{{ m.name }}</div>
                    <div class="member-role">{{ m.email }}</div>
                  </div>
                </div>
              </template>
              <div v-if="!project.owner && !project.managers?.length && !project.members?.length" class="empty-state">
                <p>{{ t('noMembers') }}</p>
              </div>
            </div>
          </div>

          <!-- Info -->
          <div class="section-card">
            <div class="section-header">
              <h2 class="section-title"><Icon name="lucide:info" />{{ t('info') }}</h2>
            </div>
            <div class="info-list">
              <div class="info-row">
                <span class="info-key">{{ t('status') }}</span>
                <span class="badge" :class="badgeClass(project.sev)">
                  <span class="badge-dot"></span>{{ project.sev }}
                </span>
              </div>
              <div class="info-row">
                <span class="info-key">{{ t('totalAlerts') }}</span>
                <span class="info-val">{{ project.alertCount || 0 }}</span>
              </div>
              <div class="info-row">
                <span class="info-key">{{ t('members') }}</span>
                <span class="info-val">{{ totalMembers }}</span>
              </div>
              <div class="info-row">
                <span class="info-key">{{ t('resolved') }}</span>
                <span class="info-val text-green">{{ resolvedCount }}</span>
              </div>
              <div class="info-row">
                <span class="info-key">{{ t('open') }}</span>
                <span class="info-val text-red">{{ openCount }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Not found -->
    <div v-else class="empty-state full-empty">
      <Icon name="lucide:folder-x" />
      <p>{{ t('projectNotFound') }}</p>
      <button class="btn-secondary" @click="router.push('/projects')">{{ t('backToProjects') }}</button>
    </div>

    <!-- Delete modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="confirm-modal">
        <h3>{{ t('deleteProject') }}</h3>
        <p>{{ t('confirmDelete') }} <strong>{{ project?.name }}</strong></p>
        <div class="confirm-actions">
          <button class="btn-cancel" @click="showDeleteModal = false">{{ t('cancel') }}</button>
          <button class="btn-delete" :disabled="deleting" @click="handleDelete">
            {{ deleting ? t('deleting') : t('delete') }}
          </button>
        </div>
      </div>
    </div>

    <!-- ─── Compose Mail Modal ─── -->
    <div v-if="showComposeModal" class="modal-overlay" @click.self="closeCompose">
      <div class="compose-modal">
        <div class="compose-modal-header">
          <div class="compose-modal-title">
            <Icon name="lucide:send" />
            <span>Gửi mail</span>
          </div>
          <button class="compose-close-btn" @click="closeCompose">
            <Icon name="lucide:x" />
          </button>
        </div>

        <div class="compose-body">
          <!-- To -->
          <div class="compose-field">
            <label class="compose-label">ĐẾN</label>
            <div class="recipient-input-wrap">
              <div class="recipient-tags">
                <span v-for="(r, i) in composeForm.recipients" :key="i" class="recipient-tag editable">
                  {{ r }}
                  <button class="remove-recipient" @click="removeRecipient(i)">
                    <Icon name="lucide:x" />
                  </button>
                </span>
              </div>
              <input
                v-model="recipientInput"
                class="recipient-input"
                placeholder="Nhập email rồi nhấn Enter..."
                @keydown.enter.prevent="addRecipient"
                @keydown.tab.prevent="addRecipient"
                @keydown.188.prevent="addRecipient"
              />
            </div>
          </div>

          <!-- Subject -->
          <div class="compose-field">
            <label class="compose-label">TIÊU ĐỀ</label>
            <input
              v-model="composeForm.subject"
              class="compose-input"
              placeholder="Nhập tiêu đề mail..."
            />
          </div>

          <!-- Body -->
          <div class="compose-field compose-field-grow">
            <label class="compose-label">NỘI DUNG</label>
            <textarea
              v-model="composeForm.body"
              class="compose-textarea"
              placeholder="Nhập nội dung mail..."
            ></textarea>
          </div>
        </div>

        <div class="compose-footer">
          <div class="compose-footer-left">
            <span class="compose-hint">
              <Icon name="lucide:info" />
              Gửi tới {{ composeForm.recipients.length }} người nhận
            </span>
          </div>
          <div class="compose-footer-actions">
            <button class="btn-cancel" @click="closeCompose">Huỷ</button>
            <button
              class="btn-send"
              :disabled="sending || !composeForm.subject || composeForm.recipients.length === 0"
              @click="handleSendMail"
            >
              <Icon :name="sending ? 'lucide:loader-2' : 'lucide:send'" :class="{ 'loading-icon': sending }" />
              {{ sending ? 'Đang gửi...' : 'Gửi mail' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from '~/composables/useI18n'
import type { Project, ProjectMember } from '~/composables/useProjects'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const { apiCall } = useApi()
const { success, error: showError } = useToast()

const { alerts, loading: alertsStoreLoading, loadAlerts } = useErrorStore()

interface AlertItem {
  id: string; title?: string; message?: string
  severity?: string; status?: string; createdAt?: string; projectId?: string; service?: string; env?: string
}

interface MailItem {
  id: string
  alertId?: string
  projectId?: string
  subject?: string
  recipients: string[]
  body?: string
  channel?: string
  type: 'auto' | 'manual'
  status: 'pending' | 'sent' | 'failed'
  errorMessage?: string
  createdAt: string
  sentAt?: string
}

interface ComposeForm {
  recipients: string[]
  subject: string
  body: string
}

interface ApiResponse<T> { success: boolean; data: T }
interface ProjectApiData {
  id?: string; _id?: string; name?: string; sev?: string; desc?: string
  avatars?: string[]; owner?: any; managers?: any[]; members?: any[]
  alertCount?: number; createdAt?: string
}

const normalizeSeverity = (sev?: string): ProjectSeverity => {
  const valid: ProjectSeverity[] = ['Critical', 'Error', 'Warning', 'Resolved']
  return valid.includes(sev as ProjectSeverity) ? (sev as ProjectSeverity) : 'Warning'
}

// ─── State ───
const project = ref<Project | null>(null)
const loading = ref(true)
const alertsLoading = computed(() => alertsStoreLoading.value)
const showDeleteModal = ref(false)
const deleting = ref(false)

// Mail state
const mailHistory = ref<MailItem[]>([])
const mailLoading = ref(false)
const expandedMailId = ref<string | null>(null)
const showComposeModal = ref(false)
const sending = ref(false)
const recipientInput = ref('')
const composeForm = ref<ComposeForm>({ recipients: [], subject: '', body: '' })

// ─── Alerts ───
const projectAlerts = computed<AlertItem[]>(() => {
  const id = String(route.params.id)
  return alerts.value.filter(a => String(a.projectId) === id)
})

const generateId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)

const createMember = (email: string, role: 'Owner' | 'Manager' | 'Member'): ProjectMember => {
  const username = email?.split('@')[0] || 'Unknown'
  return { id: generateId(), name: username, email, role, avatar: username.charAt(0).toUpperCase() }
}

const normalizeMember = (member: any, role: 'Owner' | 'Manager' | 'Member'): ProjectMember => {
  if (typeof member === 'string') return createMember(member, role)
  const email = member?.email || ''
  const username = email.split('@')[0] || 'Unknown'
  return {
    id: member?.id ?? member?._id ?? generateId(),
    name: member?.name ?? username,
    email,
    role,
    avatar: member?.avatar ?? username.charAt(0).toUpperCase()
  }
}

onMounted(async () => {
  await Promise.all([loadProject(), loadAlerts(), loadMailHistory()])
})

const loadProject = async () => {
  loading.value = true
  try {
    const res = await apiCall<ApiResponse<ProjectApiData> | ProjectApiData>(
      `/api/projects/${route.params.id}`
    )
    let data: ProjectApiData | null = null
    if (res && typeof res === 'object' && 'success' in res && 'data' in res) {
      data = res.data as ProjectApiData
    } else {
      data = res as ProjectApiData
    }
    if (data) {
      project.value = {
        id: data.id ?? data._id ?? '',
        name: data.name ?? '',
        sev: normalizeSeverity(data.sev),
        desc: data.desc ?? '',
        avatars: Array.isArray(data.avatars) ? data.avatars : [],
        owner: data.owner ? normalizeMember(data.owner, 'Owner') : null,
        managers: Array.isArray(data.managers) ? data.managers.map(m => normalizeMember(m, 'Manager')) : [],
        members: Array.isArray(data.members) ? data.members.map(m => normalizeMember(m, 'Member')) : [],
        alertCount: data.alertCount ?? 0,
        createdAt: data.createdAt ?? new Date().toISOString()
      }
    }
  } catch (err) {
    console.error(err)
    showError('Failed to load project')
  } finally {
    loading.value = false
  }
}

// ─── Mail ───
const loadMailHistory = async () => {
  mailLoading.value = true
  try {
    const res = await apiCall<MailItem[]>(
      `/api/notificationhistory/project/${route.params.id}`
    )
    mailHistory.value = res?.data ?? []
  } catch (err) {
    console.error('Failed to load mail history:', err)
    mailHistory.value = []
  } finally {
    mailLoading.value = false
  }
}

const toggleMail = (id: string) => {
  expandedMailId.value = expandedMailId.value === id ? null : id
}

const addRecipient = () => {
  const email = recipientInput.value.trim().replace(/,+$/, '')
  if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !composeForm.value.recipients.includes(email)) {
    composeForm.value.recipients.push(email)
  }
  recipientInput.value = ''
}

const removeRecipient = (index: number) => {
  composeForm.value.recipients.splice(index, 1)
}

const closeCompose = () => {
  showComposeModal.value = false
  composeForm.value = { recipients: [], subject: '', body: '' }
  recipientInput.value = ''
}

const handleSendMail = async () => {
  // Nếu còn text trong input thì thêm vào recipients
  if (recipientInput.value.trim()) addRecipient()
  if (!composeForm.value.subject || composeForm.value.recipients.length === 0) return

  sending.value = true
  try {
    // Gửi đến đúng endpoint của backend
    const res = await apiCall<MailItem>(
      `/api/notificationhistory/send`,
      {
        method: 'POST',
        body: JSON.stringify({
          projectId: route.params.id,
          recipients: composeForm.value.recipients,
          subject: composeForm.value.subject,
          body: composeForm.value.body,
          type: 'manual',
          channel: 'email'
        })
      }
    )

    if (res?.data) {
      mailHistory.value.unshift(res.data)
    } else {
      // Reload từ server đảm bảo đồng bộ
      await loadMailHistory()
    }
    success('Gửi mail thành công')
    closeCompose()
  } catch (err) {
    console.error(err)
    showError('Gửi mail thất bại')
  } finally {
    sending.value = false
  }
}

// ─── Computed ───
const totalMembers = computed(() =>
  (project.value?.owner ? 1 : 0) +
  (project.value?.managers?.length || 0) +
  (project.value?.members?.length || 0)
)
const resolvedCount = computed(() => projectAlerts.value.filter(a => a.status === 'Resolved').length)
const openCount = computed(() => projectAlerts.value.filter(a => a.status !== 'Resolved').length)

const handleDelete = async () => {
  deleting.value = true
  try {
    const res = await apiCall<ApiResponse<boolean>>(
      `/api/projects/${route.params.id}`,
      { method: 'DELETE' }
    )
    if (res?.success) {
      success('Deleted successfully')
      router.push('/projects')
    }
  } catch (err) {
    console.error(err)
    showError('Failed to delete project')
  } finally {
    deleting.value = false
    showDeleteModal.value = false
  }
}

// ─── Helpers ───
const formatTime = (time?: string) =>
  time ? new Date(time).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

const initials = (name?: string) => {
  if (!name) return '?'
  return name.split(' ').map(w => w[0] || '').join('').slice(0, 2).toUpperCase()
}

const badgeClass = (sev?: string) =>
  ({ Critical: 'badge-critical', Error: 'badge-error', Warning: 'badge-warning', Resolved: 'badge-resolved' }[sev || ''] || 'badge-warning')

const dotClass = (sev?: string) =>
  ({ Critical: 'dot-critical', Error: 'dot-error', Warning: 'dot-warning', Resolved: 'dot-resolved' }[sev || ''] || 'dot-warning')

const statusClass = (status?: string) =>
  ({ Resolved: 'status-resolved', Open: 'status-open', Active: 'status-active' }[status || ''] || 'status-open')
</script>

<style scoped>
.page-wrap { width: 100%; min-width: 0; display: flex; flex-direction: column; gap: 20px; }

.back-btn {
  display: inline-flex; align-items: center; gap: 6px;
  background: transparent; border: none; color: #586069;
  font-size: 13px; cursor: pointer; padding: 0; transition: color .15s; width: fit-content;
}
.back-btn:hover { color: #58a6ff; }

.proj-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.proj-title-row { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
.proj-title { font-size: 22px; font-weight: 700; color: #e6edf3; font-family: 'Courier New', monospace; }
.proj-desc  { font-size: 13px; color: #586069; line-height: 1.5; }
.proj-header-actions { display: flex; gap: 8px; flex-shrink: 0; }

.btn-secondary {
  display: flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 7px;
  background: transparent; border: 1px solid #30363d; color: #c9d1d9; font-size: 13px; cursor: pointer; transition: all .15s;
}
.btn-secondary:hover { border-color: #58a6ff; color: #58a6ff; }

.btn-danger {
  display: flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 7px;
  background: transparent; border: 1px solid #f85149; color: #f85149; font-size: 13px; cursor: pointer; transition: all .15s;
}
.btn-danger:hover { background: rgba(248,81,73,.1); }

.stats-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; }
.stat-card {
  background: #161b22; border: 1px solid #21262d; border-radius: 10px;
  padding: 16px; display: flex; align-items: center; gap: 14px;
}
.stat-icon { width: 38px; height: 38px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-icon svg { width: 18px; height: 18px; }
.icon-alert   { background: rgba(248,81,73,.12); color: #f85149; }
.icon-member  { background: rgba(88,166,255,.12); color: #58a6ff; }
.icon-resolve { background: rgba(63,185,80,.12);  color: #3fb950; }
.icon-open    { background: rgba(227,179,65,.12); color: #e3b341; }
.stat-val   { font-size: 22px; font-weight: 700; color: #e6edf3; line-height: 1; }
.stat-label { font-size: 12px; color: #586069; margin-top: 3px; }

/* Grid: left col + right col */
.content-grid { display: grid; grid-template-columns: 1fr 300px; gap: 16px; align-items: start; }
.left-col  { display: flex; flex-direction: column; gap: 16px; }
.right-col { display: flex; flex-direction: column; gap: 16px; }

.section-card { background: #161b22; border: 1px solid #21262d; border-radius: 10px; padding: 18px; }
.section-header {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #21262d;
}
.section-title { display: flex; align-items: center; gap: 7px; font-size: 14px; font-weight: 600; color: #e6edf3; flex: 1; }
.section-title svg { width: 14px; height: 14px; color: #586069; }
.section-header-right { display: flex; align-items: center; gap: 8px; }
.count-badge { background: #21262d; color: #8b949e; font-size: 11px; padding: 2px 8px; border-radius: 10px; }

.view-all-btn {
  display: inline-flex; align-items: center; gap: 4px;
  background: transparent; border: 1px solid #30363d; color: #8b949e;
  font-size: 11px; padding: 2px 8px; border-radius: 5px; cursor: pointer; transition: all .15s;
}
.view-all-btn:hover { border-color: #58a6ff; color: #58a6ff; }
.view-all-btn svg { width: 11px; height: 11px; }
.compose-trigger { border-color: #388bfd44; color: #58a6ff; }
.compose-trigger:hover { background: rgba(88,166,255,.08); border-color: #58a6ff; }

/* ─── Alerts ─── */
.alerts-list { display: flex; flex-direction: column; gap: 6px; }
.alert-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 12px; border-radius: 7px; transition: background .1s;
}
.alert-row:hover { background: #1c2128; }
.alert-row-left { display: flex; align-items: center; gap: 10px; }
.alert-sev-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.dot-critical { background: #f85149; } .dot-error { background: #e3b341; }
.dot-warning  { background: #d29922; } .dot-resolved { background: #3fb950; }
.alert-msg  { font-size: 13px; color: #c9d1d9; }
.alert-meta { font-size: 11px; color: #586069; margin-top: 2px; }
.alert-status { font-size: 11px; padding: 2px 8px; border-radius: 10px; background: #21262d; color: #8b949e; white-space: nowrap; }
.status-resolved { background: rgba(63,185,80,.12); color: #3fb950; }
.status-open     { background: rgba(248,81,73,.12); color: #f85149; }
.status-active   { background: rgba(227,179,65,.12); color: #e3b341; }

/* ─── Mail History ─── */
.mail-list { display: flex; flex-direction: column; gap: 4px; }

.mail-item {
  border: 1px solid #21262d;
  border-radius: 8px;
  overflow: hidden;
  transition: border-color .15s;
  cursor: pointer;
}
.mail-item:hover { border-color: #30363d; }
.mail-item.expanded { border-color: #388bfd55; }

.mail-item-header {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px;
  transition: background .1s;
}
.mail-item:hover .mail-item-header { background: #1c2128; }
.mail-item.expanded .mail-item-header { background: #1a2233; }

.mail-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 2px; }
.dot-auto   { background: #58a6ff; }
.dot-manual { background: #3fb950; }

.mail-item-info { flex: 1; min-width: 0; }
.mail-subject {
  font-size: 13px; color: #c9d1d9; font-weight: 500;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.mail-meta-row { display: flex; align-items: center; gap: 6px; margin-top: 3px; flex-wrap: wrap; }
.mail-tag {
  font-size: 10px; padding: 1px 6px; border-radius: 4px; font-weight: 600;
}
.tag-auto   { background: rgba(88,166,255,.12); color: #58a6ff; }
.tag-manual { background: rgba(63,185,80,.12);  color: #3fb950; }
.mail-from { font-size: 11px; color: #586069; }
.mail-status-dot { font-size: 6px; color: #3fb950; }
.mail-sent-status { font-size: 11px; color: #3fb950; }

.mail-item-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.mail-time { font-size: 11px; color: #586069; white-space: nowrap; }
.mail-chevron { width: 13px; height: 13px; color: #586069; transition: transform .2s; }

.mail-item-body {
  padding: 12px 14px 14px 32px;
  border-top: 1px solid #21262d;
  background: #0d1117;
  display: flex; flex-direction: column; gap: 10px;
}
.mail-detail-row { display: flex; flex-direction: column; gap: 5px; }
.mail-detail-label {
  font-size: 10px; font-weight: 700; letter-spacing: .08em;
  color: #8b949e; text-transform: uppercase;
}
.mail-recipients { display: flex; flex-wrap: wrap; gap: 5px; }
.recipient-tag {
  background: #21262d; color: #8b949e;
  font-size: 11px; padding: 2px 8px; border-radius: 4px;
}
.mail-body-text { font-size: 12px; color: #8b949e; line-height: 1.6; margin: 0; }

/* Members */
.av-owner   { background: #f85149; }
.av-manager { background: #e3b341; color: #000; }
.av-member  { background: #58a6ff; }
.members-list { display: flex; flex-direction: column; gap: 10px; }
.member-group-title {
  font-size: 11px; font-weight: 700; text-transform: uppercase;
  letter-spacing: .08em; color: #8b949e; margin-top: 10px; margin-bottom: 6px;
  padding-bottom: 6px; border-bottom: 1px solid #21262d;
}
.member-group-title:first-child { margin-top: 0; }
.member-content { display: flex; flex-direction: column; min-width: 0; }
.member-row { display: flex; align-items: center; gap: 10px; }
.avatar-lg {
  width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
  font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; color: #fff;
}
.member-name { font-size: 13px; color: #c9d1d9; font-weight: 500; }
.member-role { font-size: 11px; color: #586069; }

/* Info */
.info-list { display: flex; flex-direction: column; gap: 10px; }
.info-row  { display: flex; align-items: center; justify-content: space-between; }
.info-key  { font-size: 12px; color: #586069; }
.info-val  { font-size: 13px; color: #c9d1d9; }
.text-green { color: #3fb950; }
.text-red   { color: #f85149; }

/* Badges */
.badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: 5px; font-size: 12px; font-weight: 500; }
.badge-dot { width: 7px; height: 7px; border-radius: 50%; }
.badge-critical { background: rgba(248,81,73,.12); color: #f85149; } .badge-critical .badge-dot { background: #f85149; }
.badge-error    { background: rgba(227,179,65,.12); color: #e3b341; } .badge-error    .badge-dot { background: #e3b341; }
.badge-warning  { background: rgba(210,153,34,.12); color: #d29922; } .badge-warning  .badge-dot { background: #d29922; }
.badge-resolved { background: rgba(63,185,80,.12);  color: #3fb950; } .badge-resolved .badge-dot { background: #3fb950; }

/* Empty / Loading */
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 32px; color: #586069; font-size: 13px; text-align: center; }
.empty-state svg { width: 32px; height: 32px; opacity: .4; }
.full-empty { padding: 80px 0; }
.mini-loading { display: flex; justify-content: center; padding: 24px; }
.loading-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 80px 0; color: #586069; }
.loading-icon { animation: spin 1s linear infinite; width: 24px; height: 24px; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Modal overlay */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.6); display: flex; align-items: center; justify-content: center; z-index: 200; }

/* Delete confirm modal */
.confirm-modal { background: #1c2128; border: 1px solid #30363d; border-radius: 12px; padding: 24px; width: 380px; max-width: 90vw; }
.confirm-modal h3 { color: #e6edf3; font-size: 16px; margin-bottom: 10px; }
.confirm-modal p  { color: #8b949e; font-size: 13px; line-height: 1.6; }
.confirm-modal strong { color: #e6edf3; }
.confirm-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }
.btn-cancel { padding: 7px 16px; border-radius: 7px; background: transparent; border: 1px solid #30363d; color: #c9d1d9; font-size: 13px; cursor: pointer; }
.btn-cancel:hover { border-color: #58a6ff; color: #58a6ff; }
.btn-delete { padding: 7px 16px; border-radius: 7px; background: #f85149; border: none; color: #fff; font-size: 13px; cursor: pointer; }
.btn-delete:hover:not(:disabled) { background: #da3633; }
.btn-delete:disabled { opacity: .6; cursor: not-allowed; }

/* ─── Compose Modal ─── */
.compose-modal {
  background: #1c2128; border: 1px solid #30363d; border-radius: 12px;
  width: 560px; max-width: 95vw; max-height: 90vh;
  display: flex; flex-direction: column; overflow: hidden;
}

.compose-modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; border-bottom: 1px solid #21262d; flex-shrink: 0;
}
.compose-modal-title {
  display: flex; align-items: center; gap: 8px;
  font-size: 15px; font-weight: 600; color: #e6edf3;
}
.compose-modal-title svg { width: 15px; height: 15px; color: #58a6ff; }
.compose-close-btn {
  background: transparent; border: none; color: #586069; cursor: pointer;
  padding: 4px; border-radius: 5px; display: flex; align-items: center; transition: color .15s;
}
.compose-close-btn:hover { color: #c9d1d9; background: #21262d; }
.compose-close-btn svg { width: 16px; height: 16px; }

.compose-body {
  flex: 1; overflow-y: auto; padding: 16px 20px;
  display: flex; flex-direction: column; gap: 14px;
}

.compose-field { display: flex; flex-direction: column; gap: 6px; }
.compose-field-grow { flex: 1; }
.compose-label {
  font-size: 10px; font-weight: 700; letter-spacing: .08em;
  color: #8b949e; text-transform: uppercase;
}

/* Recipient input */
.recipient-input-wrap {
  min-height: 38px; padding: 5px 10px;
  background: #0d1117; border: 1px solid #30363d; border-radius: 7px;
  display: flex; flex-wrap: wrap; gap: 5px; align-items: center;
  transition: border-color .15s;
}
.recipient-input-wrap:focus-within { border-color: #58a6ff; }
.recipient-tags { display: contents; }
.recipient-tag.editable {
  display: inline-flex; align-items: center; gap: 4px;
  background: rgba(88,166,255,.12); color: #58a6ff;
  font-size: 11px; padding: 2px 4px 2px 8px; border-radius: 4px;
}
.remove-recipient {
  background: transparent; border: none; color: #58a6ff; cursor: pointer;
  padding: 0; display: flex; align-items: center; opacity: .7; transition: opacity .15s;
}
.remove-recipient:hover { opacity: 1; }
.remove-recipient svg { width: 10px; height: 10px; }
.recipient-input {
  flex: 1; min-width: 140px; background: transparent; border: none; outline: none;
  color: #c9d1d9; font-size: 13px; padding: 2px 0;
}
.recipient-input::placeholder { color: #586069; }

.compose-input {
  width: 100%; padding: 8px 12px;
  background: #0d1117; border: 1px solid #30363d; border-radius: 7px;
  color: #c9d1d9; font-size: 13px; outline: none; transition: border-color .15s;
  box-sizing: border-box;
}
.compose-input:focus { border-color: #58a6ff; }
.compose-input::placeholder { color: #586069; }

.compose-textarea {
  width: 100%; min-height: 140px; padding: 10px 12px;
  background: #0d1117; border: 1px solid #30363d; border-radius: 7px;
  color: #c9d1d9; font-size: 13px; outline: none; resize: vertical;
  transition: border-color .15s; line-height: 1.6; font-family: inherit;
  box-sizing: border-box;
}
.compose-textarea:focus { border-color: #58a6ff; }
.compose-textarea::placeholder { color: #586069; }

.compose-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 20px; border-top: 1px solid #21262d; flex-shrink: 0; gap: 12px;
}
.compose-footer-left { display: flex; align-items: center; }
.compose-hint {
  display: flex; align-items: center; gap: 5px;
  font-size: 12px; color: #586069;
}
.compose-hint svg { width: 12px; height: 12px; }
.compose-footer-actions { display: flex; align-items: center; gap: 8px; }

.btn-send {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 16px; border-radius: 7px;
  background: #238636; border: none; color: #fff; font-size: 13px; cursor: pointer;
  transition: background .15s;
}
.btn-send:hover:not(:disabled) { background: #2ea043; }
.btn-send:disabled { opacity: .5; cursor: not-allowed; }
.btn-send svg { width: 13px; height: 13px; }
</style>
