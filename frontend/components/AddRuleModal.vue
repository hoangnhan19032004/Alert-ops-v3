<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">{{ t('addRuleTitle') }}</h2>
        <button class="close-btn" @click="closeModal" aria-label="Close">
          <Icon name="lucide:x" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <!-- Project Selection -->
        <div class="form-group">
          <label class="form-label">
            <Icon name="lucide:folder" />
            Project *
          </label>
          <select
            v-model="form.project"
            class="form-select"
            :class="{ error: errors.project }"
            required
          >
            <option value="">{{ t('selectProject') }}</option>
            <option
              v-for="project in availableProjects.projects.value"
              :key="project.name"
              :value="project.name"
            >
              {{ project.name }} ({{ project.alertCount }} alerts)
            </option>
          </select>
          <span v-if="errors.project" class="error-text">{{ errors.project }}</span>
        </div>

        <!-- Trigger Condition -->
        <div class="form-group">
          <label class="form-label">
            <Icon name="lucide:zap" />
            Trigger Condition *
          </label>
          <div class="trigger-input-group">
            <select
              v-model="form.triggerType"
              class="form-select trigger-type"
              @change="updateTrigger"
            >
              <option value="severity">{{ t('severityLevel') }}</option>
              <option value="http">HTTP Status</option>
              <option value="custom">{{ t('customCondition') }}</option>
            </select>
            <input
              v-if="form.triggerType === 'severity'"
              v-model="form.triggerSeverity"
              type="text"
              class="form-input trigger-value"
              :placeholder="t('severityPh')"
              @input="updateTrigger"
            />
            <input
              v-if="form.triggerType === 'http'"
              v-model="form.triggerHttp"
              type="text"
              class="form-input trigger-value"
              :placeholder="t('statusCodePh')"
              @input="updateTrigger"
            />
            <input
              v-if="form.triggerType === 'custom'"
              v-model="form.triggerCustom"
              type="text"
              class="form-input trigger-value"
              :placeholder="t('keywordPh')"
              @input="updateTrigger"
            />
            <span class="trigger-x">×</span>
            <input
              v-model.number="form.triggerCount"
              type="number"
              class="form-input trigger-count"
              placeholder="1"
              min="1"
              @input="updateTrigger"
            />
          </div>
          <div class="trigger-preview">
            <span class="preview-label">Preview:</span>
            <span class="preview-value">{{ form.trigger }}</span>
          </div>
          <span v-if="errors.trigger" class="error-text">{{ errors.trigger }}</span>
        </div>

        <!-- Delay -->
        <div class="form-group">
          <label class="form-label">
            <Icon name="lucide:clock" />
            Delay *
          </label>
          <select
            v-model="form.delay"
            class="form-select"
            :class="{ error: errors.delay }"
            required
          >
            <option value="">{{ t('selectDelay') }}</option>
            <option value="Immediate">{{ t('immediate') }}</option>
            <option value="30 sec">30 seconds</option>
            <option value="1 min">1 minute</option>
            <option value="2 min">2 minutes</option>
            <option value="5 min">5 minutes</option>
            <option value="10 min">10 minutes</option>
            <option value="15 min">15 minutes</option>
            <option value="30 min">30 minutes</option>
            <option value="1 hour">1 hour</option>
          </select>
          <span v-if="errors.delay" class="error-text">{{ errors.delay }}</span>
        </div>

        <!-- Notification Channels -->
        <div class="form-group">
          <label class="form-label">
            <Icon name="lucide:bell" />
            Notification Channels *
          </label>
          <div class="channels-selection">
            <label
              v-for="channel in availableChannels"
              :key="channel.id"
              class="channel-option"
            >
              <input
                type="checkbox"
                :value="channel.id"
                v-model="form.channels"
                class="channel-checkbox"
              />
              <span class="channel-label">
                <Icon :name="channel.icon" />
                {{ channel.name }}
              </span>
            </label>
          </div>
          <div class="selected-channels">
            Selected: {{ form.channels.length }} channel{{ form.channels.length !== 1 ? 's' : '' }}
          </div>
          <span v-if="errors.channels" class="error-text">{{ errors.channels }}</span>
        </div>

        <!-- Active Toggle -->
        <div class="form-group">
          <label class="form-label toggle-label">
            <input
              v-model="form.active"
              type="checkbox"
            />
            <span class="label-text">Active Rule</span>
            <span class="label-desc">Enable this escalation rule immediately</span>
          </label>
        </div>
      </form>

      <div class="modal-footer">
        <button type="button" class="btn-cancel" @click="closeModal">
          Cancel
        </button>
        <button type="submit" class="btn-submit" @click="handleSubmit" :disabled="!isFormValid">
          <Icon name="lucide:plus" />
          Add Rule
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
const emit = defineEmits<{
  close: []
  add: [rule: any]
}>()

const { success, error: showError } = useToast()

// Get available projects from store
const availableProjects = useProjects()

const availableChannels = [
  { id: 'Email', name: 'Email', icon: 'lucide:mail' },
  { id: 'Slack', name: 'Slack', icon: 'lucide:message-square' },
  { id: 'PagerDuty', name: 'PagerDuty', icon: 'lucide:alert-triangle' }
]

const form = ref({
  project: '',
  triggerType: 'severity',
  triggerSeverity: 'critical',
  triggerHttp: '503',
  triggerCustom: 'timeout',
  triggerCount: 1,
  trigger: 'critical',
  delay: '5 min',
  channels: [] as string[],
  active: true
})

const errors = ref({
  project: '',
  trigger: '',
  delay: '',
  channels: ''
})

const isFormValid = computed(() => {
  return form.value.project.trim() &&
         form.value.trigger.trim() &&
         form.value.delay &&
         form.value.channels.length > 0 &&
         !errors.value.project &&
         !errors.value.trigger &&
         !errors.value.delay &&
         !errors.value.channels
})

const updateTrigger = () => {
  let triggerValue = ''
  switch (form.value.triggerType) {
    case 'severity':
      triggerValue = form.value.triggerSeverity.trim()
      break
    case 'http':
      triggerValue = form.value.triggerHttp.trim()
      break
    case 'custom':
      triggerValue = form.value.triggerCustom.trim()
      break
  }

  if (triggerValue && form.value.triggerCount > 1) {
    form.value.trigger = `${triggerValue} × ${form.value.triggerCount}`
  } else if (triggerValue) {
    form.value.trigger = triggerValue
  } else {
    form.value.trigger = ''
  }
}

const validateForm = () => {
  errors.value = { project: '', trigger: '', delay: '', channels: '' }

  // Validate project
  if (!form.value.project.trim()) {
    errors.value.project = 'Project is required'
  } else {
    const projectExists = availableProjects.projects.value.some(p => p.name === form.value.project)
    if (!projectExists) {
      errors.value.project = 'Selected project does not exist'
    }
  }

  // Validate trigger
  if (!form.value.trigger.trim()) {
    errors.value.trigger = 'Trigger condition is required'
  }

  // Validate delay
  if (!form.value.delay) {
    errors.value.delay = 'Delay is required'
  }

  // Validate channels
  if (form.value.channels.length === 0) {
    errors.value.channels = 'At least one notification channel is required'
  }
}

const handleSubmit = () => {
  validateForm()

  if (!isFormValid.value) {
    showError('Please fix the errors in the form')
    return
  }

  const newRule = {
    project: form.value.project,
    trigger: form.value.trigger,
    delay: form.value.delay,
    channel: form.value.channels.join(' + '),
    active: form.value.active
  }

  emit('add', newRule)
  success(`Escalation rule for "${newRule.project}" added successfully!`)
  closeModal()
}

const closeModal = () => {
  emit('close')
}

// Initialize trigger on mount
updateTrigger()

// Watch for trigger changes
watch(() => [form.value.triggerType, form.value.triggerSeverity, form.value.triggerHttp, form.value.triggerCustom, form.value.triggerCount], updateTrigger)
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: #0d1117;
  border: 1px solid #1e2735;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  width: 90%;
  max-width: 550px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #1e2735;
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: #e6edf3;
}

.close-btn {
  background: none;
  border: none;
  color: #8b949e;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.15s;
}

.close-btn:hover {
  color: #c9d1d9;
}

.modal-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #c9d1d9;
  margin-bottom: 8px;
}

.form-label svg {
  width: 16px;
  height: 16px;
  color: #8b949e;
}

.form-select,
.form-input {
  width: 100%;
  padding: 10px 12px;
  background: #161b22;
  border: 1px solid #1e2735;
  border-radius: 6px;
  color: #c9d1d9;
  font-size: 13px;
  transition: all 0.15s;
}

.form-select:focus,
.form-input:focus {
  outline: none;
  border-color: #58a6ff;
  box-shadow: 0 0 0 2px rgba(88, 166, 255, 0.1);
}

.form-select.error,
.form-input.error {
  border-color: #f85149;
}

.trigger-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.trigger-type {
  flex: 1;
  min-width: 120px;
}

.trigger-value {
  flex: 2;
  min-width: 100px;
}

.trigger-x {
  color: #8b949e;
  font-weight: 600;
}

.trigger-count {
  width: 60px;
  text-align: center;
}

.trigger-preview {
  margin-top: 8px;
  padding: 8px 12px;
  background: #161b22;
  border-radius: 4px;
  border: 1px solid #1e2735;
}

.preview-label {
  font-size: 11px;
  color: #8b949e;
  text-transform: uppercase;
  font-weight: 600;
  margin-right: 8px;
}

.preview-value {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #58a6ff;
}

.channels-selection {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
}

.channel-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #161b22;
  border: 1px solid #1e2735;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}

.channel-option:hover {
  border-color: #30363d;
}

.channel-checkbox {
  display: none;
}

.channel-checkbox:checked + .channel-label {
  color: #58a6ff;
}

.channel-checkbox:checked + .channel-label svg {
  color: #58a6ff;
}

.channel-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #c9d1d9;
  transition: color 0.15s;
}

.channel-label svg {
  width: 16px;
  height: 16px;
  color: #8b949e;
  transition: color 0.15s;
}

.selected-channels {
  font-size: 12px;
  color: #8b949e;
  margin-top: 8px;
}

.toggle-label {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
}

.toggle-label input[type="checkbox"] {
  margin-top: 3px;
  cursor: pointer;
  accent-color: #58a6ff;
}

.label-text {
  font-size: 13px;
  font-weight: 600;
  color: #c9d1d9;
  margin-bottom: 2px;
}

.label-desc {
  font-size: 12px;
  color: #8b949e;
}

.error-text {
  display: block;
  font-size: 12px;
  color: #f85149;
  margin-top: 4px;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #1e2735;
}

.btn-cancel {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid #30363d;
  border-radius: 6px;
  color: #c9d1d9;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.15s;
}

.btn-cancel:hover {
  border-color: #8b949e;
}

.btn-submit {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #238636;
  border: 1px solid #238636;
  border-radius: 6px;
  color: #fff;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.15s;
}

.btn-submit:hover:not(:disabled) {
  background: #2ea043;
  border-color: #2ea043;
}

.btn-submit:disabled {
  background: #30363d;
  border-color: #30363d;
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
