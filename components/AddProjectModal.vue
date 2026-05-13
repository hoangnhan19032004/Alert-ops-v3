<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <!-- Header -->
      <div class="modal-header">
        <h2 class="modal-title">
          {{ t('addProjectTitle') }}
        </h2>

        <button
          class="close-btn"
          @click="closeModal"
          aria-label="Close"
        >
          <Icon name="lucide:x" />
        </button>
      </div>

      <!-- Body -->
      <form
        class="modal-body"
        @submit.prevent="handleSubmit"
      >
        <!-- Project Name -->
        <div class="form-group">
          <label class="form-label">
            <Icon name="lucide:folder" />
            Project Name *
          </label>

          <input
            v-model="form.name"
            type="text"
            class="form-input"
            :placeholder="t('projectNamePh')"
            :class="{ error: errors.name }"
          />

          <span
            v-if="errors.name"
            class="error-text"
          >
            {{ errors.name }}
          </span>
        </div>

        <!-- Severity -->
        <div class="form-group">
          <label class="form-label">
            <Icon name="lucide:alert-triangle" />
            Severity Level *
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

        <!-- Description -->
        <div class="form-group">
          <label class="form-label">
            <Icon name="lucide:file-text" />
            Description *
          </label>

          <textarea
            v-model="form.desc"
            rows="3"
            class="form-textarea"
            :placeholder="t('projectDescPh')"
            :class="{ error: errors.desc }"
          ></textarea>

          <span
            v-if="errors.desc"
            class="error-text"
          >
            {{ errors.desc }}
          </span>
        </div>

        <!-- Owner -->
        <div class="form-group">
          <label class="form-label">
            <Icon name="lucide:crown" />
            Project Owner *
          </label>

          <input
            v-model="form.owner"
            type="email"
            class="form-input"
            placeholder="owner@fpt.com"
            :class="{ error: errors.owner }"
          />

          <span
            v-if="errors.owner"
            class="error-text"
          >
            {{ errors.owner }}
          </span>
        </div>

        <!-- Managers -->
        <div class="form-group">
          <label class="form-label">
            <Icon name="lucide:shield-check" />
            Managers
          </label>

          <div class="member-input-wrap">
            <input
              v-model="managerEmail"
              type="email"
              class="form-input"
              placeholder="manager@fpt.com"
              @keyup.enter.prevent="addManager"
            />

            <button
              type="button"
              class="add-member-btn"
              @click="addManager"
            >
              <Icon name="lucide:plus" />
              Add
            </button>
          </div>

          <span
            v-if="errors.managers"
            class="error-text"
          >
            {{ errors.managers }}
          </span>

          <div
            v-if="form.managers.length"
            class="member-list"
          >
            <div
              v-for="(manager, index) in form.managers"
              :key="manager"
              class="member-chip"
            >
              <div class="member-left">
                <div class="member-avatar manager-avatar">
                  {{ manager.charAt(0).toUpperCase() }}
                </div>

                <div class="member-info">
                  <span class="member-email">
                    {{ manager }}
                  </span>

                  <span class="member-role manager-role">
                    Manager
                  </span>
                </div>
              </div>

              <button
                type="button"
                class="remove-member"
                @click="removeManager(index)"
              >
                <Icon name="lucide:x" />
              </button>
            </div>
          </div>
        </div>

        <!-- Members -->
        <div class="form-group">
          <label class="form-label">
            <Icon name="lucide:users" />
            Team Members
          </label>

          <div class="member-input-wrap">
            <input
              v-model="memberEmail"
              type="email"
              class="form-input"
              placeholder="member@fpt.com"
              @keyup.enter.prevent="addMember"
            />

            <button
              type="button"
              class="add-member-btn"
              @click="addMember"
            >
              <Icon name="lucide:plus" />
              Add
            </button>
          </div>

          <span
            v-if="errors.members"
            class="error-text"
          >
            {{ errors.members }}
          </span>

          <div
            v-if="form.members.length"
            class="member-list"
          >
            <div
              v-for="(member, index) in form.members"
              :key="member"
              class="member-chip"
            >
              <div class="member-left">
                <div class="member-avatar">
                  {{ member.charAt(0).toUpperCase() }}
                </div>

                <div class="member-info">
                  <span class="member-email">
                    {{ member }}
                  </span>

                  <span class="member-role">
                    Member
                  </span>
                </div>
              </div>

              <button
                type="button"
                class="remove-member"
                @click="removeMember(index)"
              >
                <Icon name="lucide:x" />
              </button>
            </div>
          </div>

          <div class="selected-count">
            {{ totalUsers }}
            people added
          </div>
        </div>

        <!-- Alert Count -->
        <div class="form-group">
          <label class="form-label">
            <Icon name="lucide:bell" />
            Initial Alert Count
          </label>

          <input
            v-model.number="form.alertCount"
            type="number"
            min="0"
            class="form-input"
            placeholder="0"
            :class="{ error: errors.alertCount }"
          />

          <span
            v-if="errors.alertCount"
            class="error-text"
          >
            {{ errors.alertCount }}
          </span>
        </div>
      </form>

      <!-- Footer -->
      <div class="modal-footer">
        <button
          type="button"
          class="btn-cancel"
          @click="closeModal"
        >
          Cancel
        </button>

        <button
          type="button"
          class="btn-submit"
          :disabled="!isFormValid"
          @click="handleSubmit"
        >
          <Icon name="lucide:plus" />
          Add Project
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from '~/composables/useI18n'
import { useToast } from '~/composables/useToast'

const { t } = useI18n()
const { success, error: showError } = useToast()

const emit = defineEmits<{
  close: []
  add: [project: any]
}>()

const severityOptions = [
  { value: 'Critical', label: 'Critical' },
  { value: 'Error', label: 'Error' },
  { value: 'Warning', label: 'Warning' },
  { value: 'Resolved', label: 'Resolved' }
]

const form = ref({
  name: '',
  sev: 'Warning',
  desc: '',
  owner: '',
  managers: [] as string[],
  members: [] as string[],
  alertCount: 0
})

const managerEmail = ref('')
const memberEmail = ref('')

const errors = ref({
  name: '',
  desc: '',
  owner: '',
  managers: '',
  members: '',
  alertCount: ''
})

const totalUsers = computed(() => {
  return (
    form.value.members.length +
    form.value.managers.length +
    (form.value.owner ? 1 : 0)
  )
})

const validateEmail = (email: string) => {
  return /^[a-zA-Z0-9._%+-]+@fpt\.com$/.test(email)
}

const addManager = () => {
  const email = managerEmail.value.trim().toLowerCase()

  errors.value.managers = ''

  if (!email) return

  if (!validateEmail(email)) {
    errors.value.managers =
      'Manager email must be @fpt.com'
    return
  }

  if (
    form.value.managers.includes(email) ||
    form.value.members.includes(email) ||
    form.value.owner === email
  ) {
    errors.value.managers =
      'This user already exists'
    return
  }

  form.value.managers.push(email)
  managerEmail.value = ''
}

const addMember = () => {
  const email = memberEmail.value.trim().toLowerCase()

  errors.value.members = ''

  if (!email) return

  if (!validateEmail(email)) {
    errors.value.members =
      'Member email must be @fpt.com'
    return
  }

  if (
    form.value.members.includes(email) ||
    form.value.managers.includes(email) ||
    form.value.owner === email
  ) {
    errors.value.members =
      'This user already exists'
    return
  }

  form.value.members.push(email)
  memberEmail.value = ''
}

const removeManager = (index: number) => {
  form.value.managers.splice(index, 1)
}

const removeMember = (index: number) => {
  form.value.members.splice(index, 1)
}

const validateForm = () => {
  errors.value = {
    name: '',
    desc: '',
    owner: '',
    managers: '',
    members: '',
    alertCount: ''
  }

  if (!form.value.name.trim()) {
    errors.value.name =
      'Project name is required'
  }
  else if (form.value.name.length < 3) {
    errors.value.name =
      'Project name must be at least 3 characters'
  }

  if (!form.value.desc.trim()) {
    errors.value.desc =
      'Description is required'
  }
  else if (form.value.desc.length < 10) {
    errors.value.desc =
      'Description must be at least 10 characters'
  }

  if (!form.value.owner.trim()) {
    errors.value.owner =
      'Owner email is required'
  }
  else if (!validateEmail(form.value.owner)) {
    errors.value.owner =
      'Owner email must be @fpt.com'
  }

  if (form.value.alertCount < 0) {
    errors.value.alertCount =
      'Alert count cannot be negative'
  }
}

const isFormValid = computed(() => {
  return (
    form.value.name.trim() &&
    form.value.desc.trim() &&
    form.value.owner.trim() &&
    !errors.value.name &&
    !errors.value.desc &&
    !errors.value.owner &&
    !errors.value.members &&
    !errors.value.managers
  )
})

const handleSubmit = () => {
  validateForm()

  if (!isFormValid.value) {
    showError('Please fix the errors in the form')
    return
  }

  const newProject = {
    name: form.value.name.trim(),
    sev: form.value.sev,
    desc: form.value.desc.trim(),
    owner: form.value.owner.trim().toLowerCase(),
    managers: form.value.managers,
    members: form.value.members,
    alertCount: form.value.alertCount || 0
  }

  emit('add', newProject)

  success(
    `Project "${newProject.name}" added successfully!`
  )

  closeModal()
}

const closeModal = () => {
  emit('close')
}

watch(() => form.value.name, () => {
  errors.value.name = ''
})

watch(() => form.value.desc, () => {
  errors.value.desc = ''
})

watch(() => form.value.owner, () => {
  errors.value.owner = ''
})

watch(() => form.value.alertCount, () => {
  errors.value.alertCount = ''
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
}

.modal-content {
  width: 90%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  background: #0d1117;
  border: 1px solid #1e2735;
  border-radius: 14px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #1e2735;
}

.modal-title {
  color: #e6edf3;
  font-size: 18px;
  font-weight: 700;
}

.close-btn {
  background: transparent;
  border: none;
  color: #8b949e;
  cursor: pointer;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #c9d1d9;
  font-size: 13px;
  font-weight: 600;
}

.form-input,
.form-textarea {
  width: 100%;
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 8px;
  padding: 11px 12px;
  color: #c9d1d9;
  font-size: 13px;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #58a6ff;
}

.form-input.error,
.form-textarea.error {
  border-color: #f85149;
}

.form-textarea {
  resize: vertical;
}

.error-text {
  display: block;
  margin-top: 6px;
  color: #f85149;
  font-size: 12px;
}

.severity-options {
  display: grid;
  grid-template-columns: repeat(2,1fr);
  gap: 10px;
}

.severity-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 8px;
  padding: 10px 12px;
  color: #c9d1d9;
  cursor: pointer;
}

.severity-btn.active {
  border-color: #58a6ff;
  background: rgba(88,166,255,.1);
}

.severity-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.dot-critical { background: #f85149; }
.dot-error { background: #e3b341; }
.dot-warning { background: #d29922; }
.dot-resolved { background: #3fb950; }

.member-input-wrap {
  display: flex;
  gap: 10px;
}

.add-member-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #238636;
  border: none;
  border-radius: 8px;
  padding: 0 16px;
  color: white;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
}

.add-member-btn:hover {
  background: #2ea043;
}

.member-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 14px;
}

.member-chip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 10px;
  padding: 10px 12px;
}

.member-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.member-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg,#3a7bd5,#6e40c9);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 13px;
  font-weight: 700;
}

.manager-avatar {
  background: linear-gradient(135deg,#f59e0b,#ef4444);
}

.member-info {
  display: flex;
  flex-direction: column;
}

.member-email {
  color: #e6edf3;
  font-size: 13px;
}

.member-role {
  color: #8b949e;
  font-size: 11px;
}

.manager-role {
  color: #f59e0b;
}

.remove-member {
  border: none;
  background: transparent;
  color: #8b949e;
  cursor: pointer;
}

.remove-member:hover {
  color: #f85149;
}

.selected-count {
  margin-top: 10px;
  color: #8b949e;
  font-size: 12px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 18px 24px;
  border-top: 1px solid #1e2735;
}

.btn-cancel {
  background: transparent;
  border: 1px solid #30363d;
  border-radius: 8px;
  padding: 8px 16px;
  color: #c9d1d9;
  cursor: pointer;
}

.btn-submit {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #238636;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  color: white;
  cursor: pointer;
  font-weight: 600;
}

.btn-submit:disabled {
  opacity: .5;
  cursor: not-allowed;
}
</style>