<template>
  <div class="page-wrap">
    <!-- Header -->
    <div class="edit-header">
      <button class="back-btn" @click="router.back()">
        <Icon name="lucide:arrow-left" />
        {{ t('back') }}
      </button>
      <h1 class="edit-title">{{ t('edit') }} - {{ project?.name }}</h1>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <Icon name="lucide:loader-2" class="loading-icon" />
      <p>{{ t('loadingProject') }}</p>
    </div>

    <!-- Form -->
    <template v-else-if="project">
      <form class="edit-form" @submit.prevent="handleSubmit">
        <div class="form-container">
          <!-- Left Column -->
          <div class="form-left">
            <!-- Project Name -->
            <div class="form-group">
              <label class="form-label">
                <Icon name="lucide:folder" />
                {{ t('projectName') }} *
              </label>
              <input
                v-model="form.name"
                type="text"
                class="form-input"
                :placeholder="t('projectNamePh')"
                :class="{ error: errors.name }"
              />
              <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
            </div>

            <!-- Description -->
            <div class="form-group">
              <label class="form-label">
                <Icon name="lucide:file-text" />
                {{ t('projectDesc') }}
              </label>
              <textarea
                v-model="form.desc"
                rows="4"
                class="form-textarea"
                :placeholder="t('projectDescPh')"
              ></textarea>
            </div>

            <!-- Severity Level -->
            <div class="form-group">
              <label class="form-label">
                <Icon name="lucide:alert-triangle" />
                {{ t('severity') }} *
              </label>
              <div class="severity-options">
                <button
                  v-for="severity in severityOptions"
                  :key="severity.value"
                  type="button"
                  class="severity-btn"
                  :class="{ active: form.sev === severity.value }"
                  @click="form.sev = severity.value"
                >
                  <span
                    class="severity-dot"
                    :class="`dot-${severity.value.toLowerCase()}`"
                  ></span>
                  {{ severity.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="form-right">
            <!-- Owner -->
            <div class="form-group">
              <label class="form-label">
                <Icon name="lucide:crown" />
                {{ t('owner') }} *
              </label>
              <input
                v-model="form.owner"
                type="email"
                class="form-input"
                placeholder="owner@example.com"
                :class="{ error: errors.owner }"
              />
              <span v-if="errors.owner" class="error-text">{{ errors.owner }}</span>
            </div>

            <!-- Managers -->
            <div class="form-group">
              <label class="form-label">
                <Icon name="lucide:shield-check" />
                {{ t('managers') }}
              </label>
              <div class="members-list">
                <div
                  v-for="(manager, idx) in form.managers"
                  :key="idx"
                  class="member-chip"
                >
                  <span>{{ manager }}</span>
                  <button
                    type="button"
                    class="remove-btn"
                    @click.prevent="removeManager(idx)"
                  >
                    <Icon name="lucide:x" />
                  </button>
                </div>
              </div>
              <div class="member-input-wrap">
                <input
                  v-model="managerEmail"
                  type="email"
                  class="form-input"
                  placeholder="manager@example.com"
                  @keyup.enter.prevent="addManager"
                />
                <button
                  type="button"
                  class="add-member-btn"
                  @click.prevent="addManager"
                >
                  <Icon name="lucide:plus" />
                  {{ t('add') }}
                </button>
              </div>
            </div>

            <!-- Team Members -->
            <div class="form-group">
              <label class="form-label">
                <Icon name="lucide:users" />
                {{ t('teamMembers') }}
              </label>
              <div class="members-list">
                <div
                  v-for="(member, idx) in form.members"
                  :key="idx"
                  class="member-chip"
                >
                  <span>{{ member }}</span>
                  <button
                    type="button"
                    class="remove-btn"
                    @click.prevent="removeMember(idx)"
                  >
                    <Icon name="lucide:x" />
                  </button>
                </div>
              </div>
              <div class="member-input-wrap">
                <input
                  v-model="memberEmail"
                  type="email"
                  class="form-input"
                  placeholder="member@example.com"
                  @keyup.enter.prevent="addMember"
                />
                <button
                  type="button"
                  class="add-member-btn"
                  @click.prevent="addMember"
                >
                  <Icon name="lucide:plus" />
                  {{ t('add') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button
            type="button"
            class="btn-cancel"
            @click="router.back()"
          >
            {{ t('cancel') }}
          </button>
          <button
            type="submit"
            class="btn-save"
            :disabled="!isFormValid || saving"
          >
            <Icon :name="saving ? 'lucide:loader-2' : 'lucide:save'" :class="{ 'loading-icon': saving }" />
            {{ saving ? t('saving') : t('save') }}
          </button>
        </div>
      </form>
    </template>

    <!-- Not found -->
    <div v-else class="empty-state">
      <Icon name="lucide:folder-x" />
      <p>{{ t('projectNotFound') }}</p>
      <button class="btn-secondary" @click="router.push('/projects')">
        {{ t('backToProjects') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from '~/composables/useI18n'
import type { Project, ProjectSeverity } from '~/composables/useProjects'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const { apiCall } = useApi()
const { success, error: showError } = useToast()

interface ApiResponse<T> {
  success: boolean
  data: T
}

interface ProjectApiData {
  id?: string
  _id?: string
  name?: string
  sev?: string
  desc?: string
  owner?: any
  managers?: any[]
  members?: any[]
}

interface EditForm {
  name: string
  desc: string
  sev: ProjectSeverity
  owner: string
  managers: string[]
  members: string[]
}

interface FormErrors {
  name?: string
  owner?: string
  managers?: string
}

const severityOptions: Array<{ value: ProjectSeverity; label: string }> = [
  { value: 'Critical', label: 'Critical' },
  { value: 'Error', label: 'Error' },
  { value: 'Warning', label: 'Warning' },
  { value: 'Resolved', label: 'Resolved' }
]

// State
const project = ref<Project | null>(null)
const loading = ref(true)
const saving = ref(false)
const managerEmail = ref('')
const memberEmail = ref('')

const form = ref<EditForm>({
  name: '',
  desc: '',
  sev: 'Warning',
  owner: '',
  managers: [],
  members: []
})

const errors = ref<FormErrors>({})

// Computed
const isFormValid = computed(() => {
  return form.value.name.trim() !== '' &&
         form.value.owner.trim() !== '' &&
         /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.owner)
})

// Methods
const normalizeSeverity = (sev?: string): ProjectSeverity => {
  const valid: ProjectSeverity[] = ['Critical', 'Error', 'Warning', 'Resolved']
  return valid.includes(sev as ProjectSeverity) ? (sev as ProjectSeverity) : 'Warning'
}

const extractEmails = (data: any): string[] => {
  if (!Array.isArray(data)) return []
  return data
    .map(item => (typeof item === 'string' ? item : item?.email))
    .filter(email => email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
}

const loadProject = async () => {
  loading.value = true
  try {
    const res = await apiCall<ApiResponse<ProjectApiData> | ProjectApiData>(
      `/api/projects/${route.params.id}`
    )

    let data: ProjectApiData | null = null
    if (res && typeof res === 'object' && 'success' in res && 'data' in res) {
      data = (res as ApiResponse<ProjectApiData>).data
    } else {
      data = res as ProjectApiData
    }

    if (data) {
      const owner = data.owner
        ? typeof data.owner === 'string'
          ? data.owner
          : data.owner.email || ''
        : ''

      form.value = {
        name: data.name ?? '',
        desc: data.desc ?? '',
        sev: normalizeSeverity(data.sev),
        owner,
        managers: extractEmails(data.managers),
        members: extractEmails(data.members)
      }

      project.value = {
        id: data.id ?? data._id ?? '',
        name: data.name ?? '',
        sev: normalizeSeverity(data.sev),
        desc: data.desc ?? '',
        avatars: [],
        owner: null,
        managers: [],
        members: [],
        alertCount: 0,
        createdAt: ''
      }
    }
  } catch (err) {
    console.error(err)
    showError('Failed to load project')
  } finally {
    loading.value = false
  }
}

const validateForm = (): boolean => {
  errors.value = {}

  if (!form.value.name.trim()) {
    errors.value.name = 'Project name is required'
  }

  if (!form.value.owner.trim()) {
    errors.value.owner = 'Owner email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.owner)) {
    errors.value.owner = 'Invalid email format'
  }

  return Object.keys(errors.value).length === 0
}

const addManager = () => {
  const email = managerEmail.value.trim()
  if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !form.value.managers.includes(email)) {
    form.value.managers.push(email)
    managerEmail.value = ''
  }
}

const removeManager = (index: number) => {
  form.value.managers.splice(index, 1)
}

const addMember = () => {
  const email = memberEmail.value.trim()
  if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !form.value.members.includes(email)) {
    form.value.members.push(email)
    memberEmail.value = ''
  }
}

const removeMember = (index: number) => {
  form.value.members.splice(index, 1)
}

const handleSubmit = async () => {
  if (!validateForm()) {
    showError('Please fix errors in the form')
    return
  }

  saving.value = true
  try {
    await apiCall(`/api/projects/${route.params.id}`, {
      method: 'PUT',
      body: {
        name: form.value.name,
        desc: form.value.desc,
        sev: form.value.sev,
        owner: form.value.owner,
        managers: form.value.managers,
        members: form.value.members
      }
    })

    success('Project updated successfully')
    router.back()
  } catch (err) {
    console.error(err)
    showError('Failed to update project')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadProject()
})
</script>

<style scoped>
.page-wrap {
  width: 100%;
  min-width: 0;
  padding: 20px;
}

.edit-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 6px;
  background: #21262d;
  border: 1px solid #30363d;
  color: #c9d1d9;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.back-btn:hover {
  border-color: #58a6ff;
  color: #58a6ff;
}

.edit-title {
  font-size: 24px;
  font-weight: 700;
  color: #e6edf3;
  margin: 0;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #8b949e;
}

.loading-icon {
  width: 32px;
  height: 32px;
  margin-bottom: 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.edit-form {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 12px;
  padding: 24px;
}

.form-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

@media (max-width: 1024px) {
  .form-container {
    grid-template-columns: 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #c9d1d9;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.form-input,
.form-textarea {
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid #30363d;
  background: #0d1117;
  color: #c9d1d9;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  transition: all 0.15s;
}

.form-input:focus,
.form-textarea:focus {
  border-color: #58a6ff;
  box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.1);
}

.form-input.error,
.form-textarea.error {
  border-color: #f85149;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.error-text {
  font-size: 12px;
  color: #f85149;
}

.severity-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.severity-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid #30363d;
  background: #0d1117;
  color: #8b949e;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.severity-btn:hover {
  border-color: #58a6ff;
  color: #58a6ff;
}

.severity-btn.active {
  background: #238636;
  border-color: #238636;
  color: #fff;
}

.severity-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot-critical { background: #f85149; }
.dot-error { background: #e3b341; }
.dot-warning { background: #d29922; }
.dot-resolved { background: #3fb950; }

.severity-btn.active .dot-critical,
.severity-btn.active .dot-error,
.severity-btn.active .dot-warning,
.severity-btn.active .dot-resolved {
  background: #fff;
}

.members-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.member-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(88, 166, 255, 0.1);
  border: 1px solid rgba(88, 166, 255, 0.2);
  color: #58a6ff;
  font-size: 12px;
  font-weight: 500;
}

.remove-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  border-radius: 3px;
  transition: all 0.15s;
}

.remove-btn:hover {
  background: rgba(248, 81, 73, 0.2);
  color: #f85149;
}

.member-input-wrap {
  display: flex;
  gap: 8px;
}

.member-input-wrap .form-input {
  flex: 1;
}

.add-member-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 14px;
  border-radius: 6px;
  background: #238636;
  border: 1px solid #238636;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.add-member-btn:hover {
  background: #2ea043;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #21262d;
}

.btn-cancel,
.btn-save {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-cancel {
  background: transparent;
  border: 1px solid #30363d;
  color: #8b949e;
}

.btn-cancel:hover {
  border-color: #58a6ff;
  color: #58a6ff;
}

.btn-save {
  background: #238636;
  border: 1px solid #238636;
  color: #fff;
}

.btn-save:hover:not(:disabled) {
  background: #2ea043;
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: default;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #8b949e;
  text-align: center;
}

.empty-state svg {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 14px;
  margin-bottom: 16px;
}

.btn-secondary {
  padding: 10px 20px;
  border-radius: 6px;
  background: #21262d;
  border: 1px solid #30363d;
  color: #c9d1d9;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-secondary:hover {
  border-color: #58a6ff;
  color: #58a6ff;
}
</style>
