<template>
  <Teleport to="body">
    <Transition name="panel">
      <div v-if="alert" class="panel-overlay" @click.self="$emit('close')">
        <div class="detail-panel" role="dialog" aria-modal="true">
          <!-- Header -->
          <div class="panel-header">
            <div class="header-info">
              <div class="panel-id">{{ t('alertId') }}{{ shortId }}</div>
              <span class="badge" :class="severityBadgeClass">
                <span class="badge-dot"></span>{{ alert.severity }}
              </span>
            </div>
            <button class="close-btn" @click="$emit('close')" title="Close">✕</button>
          </div>

          <!-- Body -->
          <div class="panel-body">
            <!-- Meta row -->
            <div class="meta-grid">
              <div class="meta-item">
                <div class="meta-label">{{ t('service') }}</div>
                <div class="meta-value mono">{{ alert.service }}</div>
              </div>
              <div class="meta-item">
                <div class="meta-label">{{ t('environment') }}</div>
                <span class="env-badge" :class="envClass">{{ alert.env }}</span>
              </div>
              <div class="meta-item">
                <div class="meta-label">{{ t('status') }}</div>
                <span :class="statusClass">{{ alert.status }}</span>
              </div>
              <div class="meta-item">
                <div class="meta-label">{{ t('createdAt') }}</div>
                <div class="meta-value">{{ formatTimeFull }}</div>
              </div>
            </div>

            <!-- Message -->
            <div class="section">
              <div class="section-label">{{ t('message') }}</div>
              <div class="message-box">{{ alert.message }}</div>
            </div>

            <!-- Status Timeline -->
            <div class="section">
              <div class="section-label">{{ t('statusHistory') }}</div>
              <div class="timeline">
                <div v-for="(ev, i) in timeline" :key="i" class="tl-item">
                  <div class="tl-dot" :class="`tl-${ev.color}`"></div>
                  <div v-if="i < timeline.length - 1" class="tl-line"></div>
                  <div class="tl-text">
                    <span class="tl-label">{{ ev.label }}</span>
                    <span class="tl-time">{{ ev.time }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Change Status -->
            <div class="section">
              <div class="section-label">{{ t('status') }}</div>
              <div class="action-buttons">
                <button
                  v-for="s in statusActions" :key="s.status"
                  class="action-btn" :class="s.cls"
                  :disabled="alert.status === s.status"
                  @click="$emit('statusChange', alert, s.status)"
                >
                  <Icon :name="s.icon" />{{ s.label }}
                </button>
              </div>
            </div>

            <!-- Danger zone -->
            <div class="section danger-zone">
              <div class="section-label">Danger Zone</div>
              <button class="delete-btn" @click="$emit('delete', alert.id)">
                <Icon name="lucide:trash-2" /> Delete Alert
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useI18n } from '~/composables/useI18n'

interface AlertData {
  id?: string
  message: string
  service: string
  severity: string
  status?: string
  env?: string
  createdAt?: string
}
const { t } = useI18n()
const props = defineProps<{ alert: AlertData | null }>()
defineEmits<{
  close: []
  statusChange: [alert: AlertData, status: string]
  delete: [id: string | undefined]
}>()

const shortId = computed(() => props.alert?.id?.slice(-6) ?? '—')
const formatTimeFull = computed(() =>
  props.alert?.createdAt ? new Date(props.alert.createdAt).toLocaleString() : '—'
)

const severityBadgeClass = computed(() => ({
  Critical: 'badge-critical', Error: 'badge-error', Warning: 'badge-warning', Info: 'badge-info'
})[props.alert?.severity ?? ''] ?? '')

const envClass = computed(() =>
  props.alert?.env === 'Staging' ? 'env-staging' : 'env-production'
)

const statusClass = computed(() => ({
  Open: 'status-open', Acknowledged: 'status-ack', Escalated: 'status-esc', Resolved: 'status-res'
})[props.alert?.status ?? ''] ?? '')

const timeline = computed(() => {
  const s = props.alert?.status
  const t = props.alert?.createdAt ? new Date(props.alert.createdAt).toLocaleTimeString() : '—'
  const events = [{ label: 'Alert Created', time: t, color: 'blue' }]
  if (s === 'Acknowledged' || s === 'Escalated' || s === 'Resolved')
    events.push({ label: 'Acknowledged', time: 'recorded', color: 'yellow' })
  if (s === 'Escalated' || s === 'Resolved')
    events.push({ label: 'Escalated', time: 'recorded', color: 'red' })
  if (s === 'Resolved')
    events.push({ label: 'Resolved ✓', time: 'recorded', color: 'green' })
  return events
})

const statusActions = [
  { status: 'Open',         label: 'Reopen',      cls: 'btn-open',  icon: 'lucide:rotate-ccw' },
  { status: 'Acknowledged', label: 'Acknowledge',  cls: 'btn-ack',   icon: 'lucide:clock' },
  { status: 'Escalated',    label: 'Escalate',     cls: 'btn-esc',   icon: 'lucide:arrow-up-right' },
  { status: 'Resolved',     label: 'Resolve',      cls: 'btn-res',   icon: 'lucide:check' },
]
</script>

<style scoped>
.panel-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.55); z-index: 1000;
  display: flex; justify-content: flex-end;
}
.detail-panel {
  width: 440px; height: 100vh; background: var(--bg-secondary); border-left: 1px solid var(--border-color);
  overflow-y: auto; display: flex; flex-direction: column;
}

/* Transition */
.panel-enter-active, .panel-leave-active { transition: all .22s ease; }
.panel-enter-from .detail-panel, .panel-leave-to .detail-panel { transform: translateX(100%); opacity: 0; }

.panel-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 20px 22px; border-bottom: 1px solid var(--border-color);
  position: sticky; top: 0; background: var(--bg-secondary); z-index: 10;
}
.header-info { display: flex; flex-direction: column; gap: 8px; }
.panel-id { font-family: 'Courier New', monospace; font-size: 18px; font-weight: 700; color: #58a6ff; }
.close-btn {
  background: var(--bg-tertiary); border: 1px solid var(--border-color); color: var(--text-tertiary);
  cursor: pointer; width: 32px; height: 32px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0;
  transition: all .15s;
}
.close-btn:hover { color: var(--text-secondary); border-color: var(--text-secondary); }

.panel-body { padding: 20px 22px; display: flex; flex-direction: column; gap: 20px; }

.meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.meta-item { display: flex; flex-direction: column; gap: 5px; }
.meta-label { font-size: 11px; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: .06em; }
.meta-value { font-size: 13px; color: var(--text-secondary); }
.meta-value.mono { font-family: 'Courier New', monospace; }

.env-badge { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
.env-production { background: rgba(248,81,73,.15); color: #f85149; }
.env-staging    { background: rgba(210,153,34,.15); color: #d29922; }
.status-open { color: #3fb950; font-weight: 600; }
.status-ack  { color: #e3b341; font-weight: 600; }
.status-esc  { color: #f85149; font-weight: 600; }
.status-res  { color: #58a6ff; font-weight: 600; }

.badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; width: fit-content; }
.badge-dot { width: 7px; height: 7px; border-radius: 50%; }
.badge-critical { background: rgba(248,81,73,.12);  color: #f85149; } .badge-critical .badge-dot { background: #f85149; }
.badge-error    { background: rgba(227,179,65,.12); color: #e3b341; } .badge-error    .badge-dot { background: #e3b341; }
.badge-warning  { background: rgba(210,153,34,.12); color: #d29922; } .badge-warning  .badge-dot { background: #d29922; }
.badge-info     { background: rgba(88,166,255,.12); color: #58a6ff; } .badge-info     .badge-dot { background: #58a6ff; }

.section { display: flex; flex-direction: column; gap: 10px; }
.section-label { font-size: 11px; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: .06em; }
.message-box {
  background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px;
  padding: 14px; color: var(--text-secondary); font-size: 13px; line-height: 1.6;
}

/* Timeline */
.timeline { display: flex; flex-direction: column; }
.tl-item { display: flex; align-items: flex-start; gap: 12px; position: relative; }
.tl-dot  { width: 14px; height: 14px; border-radius: 50%; margin-top: 3px; flex-shrink: 0; }
.tl-line { position: absolute; left: 6px; top: 17px; width: 2px; height: calc(100% + 4px); background: var(--border-color); }
.tl-blue   { background: #58a6ff; }
.tl-yellow { background: #e3b341; }
.tl-red    { background: #f85149; }
.tl-green  { background: #3fb950; }
.tl-text   { display: flex; flex-direction: column; gap: 2px; padding-bottom: 16px; }
.tl-label  { font-size: 13px; color: var(--text-secondary); font-weight: 500; }
.tl-time   { font-size: 11px; color: var(--text-tertiary); }

/* Action buttons */
.action-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.action-btn {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 9px 12px; border-radius: 7px; font-size: 12px; font-weight: 600;
  cursor: pointer; border: 1px solid; transition: all .15s;
}
.action-btn:disabled { opacity: .35; cursor: default; }
.btn-open { border-color: #586069; color: #8b949e; background: transparent; }
.btn-open:hover:not(:disabled) { background: rgba(255,255,255,.05); }
.btn-ack  { border-color: #e3b341; color: #e3b341; background: rgba(227,179,65,.08); }
.btn-ack:hover:not(:disabled)  { background: rgba(227,179,65,.18); }
.btn-esc  { border-color: #f85149; color: #f85149; background: rgba(248,81,73,.08); }
.btn-esc:hover:not(:disabled)  { background: rgba(248,81,73,.18); }
.btn-res  { border-color: #3fb950; color: #3fb950; background: rgba(63,185,80,.08); }
.btn-res:hover:not(:disabled)  { background: rgba(63,185,80,.18); }

/* Danger zone */
.danger-zone { border-top: 1px solid #21262d; padding-top: 20px; }
.delete-btn {
  display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 7px;
  background: transparent; border: 1px solid #f85149; color: #f85149;
  font-size: 13px; font-weight: 600; cursor: pointer; transition: all .15s;
}
.delete-btn:hover { background: rgba(248,81,73,.1); }
</style>
