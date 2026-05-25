<template>
  <div class="page-wrap">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('escalationTitle') }}</h1>
        <p class="page-sub">{{ t('escalationSub') }}</p>
      </div>
      <button class="add-btn" @click="showAddRuleModal = true">{{ t('addRule') }}</button>
    </div>

    <!-- Notification Channels -->
    <div class="section-card" style="margin-bottom:20px">
      <div class="section-label">{{ t('notifChannels') }}</div>
      <div class="channels-grid">
        <div class="channel email">
          <div class="channel-top">
            <span class="ch-name email-name">Email</span>
            <span class="active-badge">{{ t('active') }}</span>
          </div>
          <div class="ch-sub">ops-alerts@fpt.com</div>
        </div>
        <div class="channel slack">
          <div class="channel-top">
            <span class="ch-name slack-name">Slack</span>
            <span class="active-badge">{{ t('active') }}</span>
          </div>
          <div class="ch-sub">#ops-critical</div>
        </div>
        <div class="channel pagerduty">
          <div class="channel-top">
            <span class="ch-name pd-name">PagerDuty</span>
            <span class="active-badge">{{ t('active') }}</span>
          </div>
          <div class="ch-sub">ftel-oncall</div>
        </div>
      </div>
    </div>

    <!-- Rules Table -->
    <div class="section-card">
      <table class="esc-table">
        <thead>
          <tr>
            <th>{{ t('project').toUpperCase() }}</th>
            <th>{{ t('trigger').toUpperCase() }}</th>
            <th>{{ t('delay').toUpperCase() }}</th>
            <th>{{ t('channel').toUpperCase() }}</th>
            <th>{{ t('active').toUpperCase() }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="rule in escRules" :key="rule.id">
            <td><span class="proj-link">{{ rule.project }}</span></td>
            <td><span class="trigger-badge" :class="triggerClass(rule.trigger)">{{ rule.trigger }}</span></td>
            <td>{{ rule.delay }}</td>
            <td>{{ rule.channel }}</td>
            <td>
              <button
                class="toggle-btn"
                :class="rule.active ? 'toggle-on' : 'toggle-off'"
                @click="toggleRule(rule)"
              >{{ rule.active ? t('on') : t('off') }}</button>
            </td>
            <td><button class="del-btn" @click="removeRule(rule)">×</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add Rule Modal -->
    <AddRuleModal
      v-if="showAddRuleModal"
      @close="showAddRuleModal = false"
      @add="addRule"
    />
  </div>
</template>

<script setup>
import { useI18n } from '~/composables/useI18n'
const { t } = useI18n()
// useEscRules() từ composables/useAlertStore.ts — Nuxt auto-import, load từ API
const { escRules, escRulesLoading, loadRules } = useEscRules()
const { success, error: showError } = useToast()
const toggleRule = async (rule) => {
  const oldStatus = rule.active
  const newStatus = !oldStatus

  // 👉 update UI trước cho mượt
  rule.active = newStatus

  try {
    const response = await useApi().apiCall(`/api/escalationrules/${rule.id}`, {
      method: 'PUT',
      body: {
        ...rule,
        active: newStatus
      }
    })

    // ⚠️ backend bạn đang trả NoContent() => không có response.success
    if (!response) {
      success?.('Updated successfully!')
    }

  } catch (err) {
    console.error('Toggle error:', err)

    // ❌ rollback nếu lỗi
    rule.active = oldStatus

    showError?.('Update failed!')
  }
}

// Modal state
const showAddRuleModal = ref(false)

// Auto-reload data when entering the page
onMounted(async () => {
  await loadRules()
})

const triggerClass = t => {
  if (t.includes('critical'))  return 'trig-critical'
  if (t.includes('warning'))   return 'trig-warning'
  return 'trig-other'
}

const removeRule = async (rule) => {
  try {
    const response = await useApi().apiCall(`/api/escalationrules/${rule.id}`, {
      method: 'DELETE'
    })
    if (response.success) {
      const i = escRules.value.indexOf(rule)
      if (i > -1) escRules.value.splice(i, 1)
      success('Rule deleted successfully!')
    } else {
      showError('Failed to delete rule')
    }
  } catch (err) {
    console.error('Error deleting rule:', err)
    showError('Error deleting rule')
  }
}

const addRule = async (newRule) => {
  try {
    const response = await useApi().apiCall('/api/escalationrules', {
      method: 'POST',
      body: newRule
    })
    if (response.success && response.data) {
      escRules.value.push(response.data)
      showAddRuleModal.value = false
      success('Rule added successfully!')
    } else {
      showError('Failed to add rule')
    }
  } catch (err) {
    console.error('Error adding rule:', err)
    showError('Error adding rule')
  }
}
</script>

<style scoped>
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 22px; }
.page-title  { font-size: 22px; font-weight: 700; color: var(--text-primary); }
.page-sub    { font-size: 13px; color: var(--text-muted); margin-top: 3px; }
.add-btn {
  padding: 8px 16px; border-radius: 7px; background: transparent;
  border: 1px solid var(--input-border); color: var(--text-secondary); font-size: 13px; cursor: pointer; transition: all .15s;
}
.add-btn:hover { border-color: var(--accent-color); color: var(--accent-color); }

.section-card { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 10px; padding: 20px; }
.section-label { font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 14px; }

.channels-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: var(--bg-tertiary); border-radius: 8px; overflow: hidden; }
.channel { background: var(--bg-primary); padding: 16px 18px; }
.channel-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.ch-name { font-weight: 600; font-size: 14px; }
.email-name  { color: var(--accent-color); }
.slack-name  { color: #e3b341; }
.pd-name     { color: var(--danger-color); }
.ch-sub      { font-family: 'Courier New', monospace; font-size: 12px; color: var(--text-muted); }
.active-badge { background: rgba(63,185,80,.15); color: var(--success-color); font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 4px; }

.esc-table { width: 100%; border-collapse: collapse; }
.esc-table th {
  text-align: left; font-size: 11px; font-weight: 600; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: .05em; padding: 8px 12px;
  border-bottom: 1px solid var(--border-color);
}
.esc-table td { padding: 14px 12px; border-bottom: 1px solid #161b22; font-size: 13px; color: var(--text-secondary); }
.esc-table tr:last-child td { border-bottom: none; }

.proj-link { font-family: 'Courier New', monospace; color: var(--accent-color); }

.trigger-badge { padding: 3px 9px; border-radius: 4px; font-size: 12px; font-weight: 600; }
.trig-critical { background: rgba(248,81,73,.18);  color: var(--danger-color); }
.trig-warning  { background: rgba(210,153,34,.18); color: var(--warning-color); }
.trig-other    { background: rgba(227,179,65,.18); color: #e3b341; }

.toggle-btn {
  padding: 3px 12px; border-radius: 20px; font-size: 12px; font-weight: 700;
  border: none; cursor: pointer; transition: all .15s;
}
.toggle-on  { background: #1a7f37; color: var(--success-color); }
.toggle-off { background: var(--bg-tertiary); color: var(--text-muted); }
.del-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 18px; padding: 2px 6px; }
.del-btn:hover { color: var(--danger-color); }
.page-wrap { width: 100%; min-width: 0; }
</style>
