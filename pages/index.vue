<template>
  <div class="page-wrap">
    <!-- Header -->
    <div class="dash-header">
      <div>
        <h1 class="page-title">{{ t('dashboard') }}</h1>
        <p class="page-sub">{{ t('dashboardSub') }}</p>
      </div>
      <div class="header-right">
        <span v-if="apiConnected" class="live-badge">
          <span class="live-dot"></span> LIVE
        </span>
        <span v-else class="offline-badge">{{ t('offline') }}</span>
        <button class="refresh-btn" @click="refreshAll" :disabled="loading">
          <Icon name="lucide:refresh-ccw" :class="{ spinning: loading }" />
        </button>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="kpi-grid">
      <div class="kpi-card kpi-blue" @click="navigateTo('/alerts')">
        <div class="kpi-icon"><Icon name="lucide:alert-triangle" /></div>
        <div class="kpi-content">
          <div class="kpi-label">{{ t('totalAlerts') }}</div>
          <div class="kpi-value">{{ totalAlerts }}</div>
          <div class="kpi-sub">{{ openCount }} {{ t('openNow') }}</div>
        </div>
        <div class="kpi-trend up" v-if="criticalCount > 0">{{ criticalCount }} {{ t('critical') }}</div>
      </div>

      <div class="kpi-card kpi-red" @click="navigateTo('/alerts?filter=open')">
        <div class="kpi-icon"><Icon name="lucide:alert-circle" /></div>
        <div class="kpi-content">
          <div class="kpi-label">{{ t('open') }}</div>
          <div class="kpi-value">{{ openCount }}</div>
          <div class="kpi-sub">{{ t('needAttention') }}</div>
        </div>
      </div>

      <div class="kpi-card kpi-orange" @click="navigateTo('/alerts?filter=escalated')">
        <div class="kpi-icon"><Icon name="lucide:arrow-up-right" /></div>
        <div class="kpi-content">
          <div class="kpi-label">{{ t('escalated') }}</div>
          <div class="kpi-value">{{ escalatedCount }}</div>
          <div class="kpi-sub">{{ t('highPriority') }}</div>
        </div>
      </div>

      <div class="kpi-card kpi-green" @click="navigateTo('/alerts?filter=resolved')">
        <div class="kpi-icon"><Icon name="lucide:check-circle" /></div>
        <div class="kpi-content">
          <div class="kpi-label">{{ t('resolved') }}</div>
          <div class="kpi-value">{{ resolvedCount }}</div>
          <div class="kpi-sub">{{ t('last24h') }} {{ resolvedToday }}</div>
        </div>
      </div>
    </div>

    <!-- 2-column layout -->
    <div class="dash-grid">
      <!-- Recent Critical Alerts -->
      <div class="dash-card">
        <div class="card-header">
          <div class="card-title">{{ t('criticalEscalated') }}</div>
          <NuxtLink to="/alerts" class="card-link">{{ t('viewAll') }}</NuxtLink>
        </div>
        <div class="alert-list">
          <div v-if="urgentAlerts.length === 0" class="empty-card">
            <Icon name="lucide:check" /> {{ t('noCritical') }}
          </div>
          <div
            v-for="a in urgentAlerts" :key="a.id"
            class="alert-item" :class="a.severity === 'Critical' ? 'item-critical' : 'item-escalated'"
          >
            <div class="item-left">
              <span class="item-sev" :class="a.severity === 'Critical' ? 'badge-critical' : 'badge-error'">
                {{ a.severity }}
              </span>
              <span class="item-msg">{{ a.message }}</span>
            </div>
            <div class="item-right">
              <span class="item-service">{{ a.service }}</span>
              <span class="item-time">{{ formatTime(a.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Severity Breakdown -->
      <div class="dash-card">
        <div class="card-header">
          <div class="card-title">{{ t('bySeverity') }}</div>
        </div>
        <div class="sev-breakdown">
          <div class="sev-row" v-for="sev in severityBreakdown" :key="sev.label">
            <span class="sev-label" :class="sev.cls">{{ sev.label }}</span>
            <div class="sev-bar-track">
              <div class="sev-bar-fill" :style="{ width: sev.pct + '%', background: sev.color }"></div>
            </div>
            <span class="sev-count">{{ sev.count }}</span>
          </div>
        </div>

        <!-- Service Breakdown -->
        <div class="card-header" style="margin-top: 20px;">
          <div class="card-title">{{ t('topServices') }}</div>
        </div>
        <div class="service-list">
          <div class="service-row" v-for="s in topServices" :key="s.name">
            <span class="service-name">{{ s.name }}</span>
            <span class="service-cnt" :class="s.count > 5 ? 'cnt-red' : 'cnt-normal'">{{ s.count }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Projects status row -->
    <div class="dash-card">
      <div class="card-header">
        <div class="card-title">{{ t('projectsHealth') }}</div>
        <NuxtLink to="/projects" class="card-link">{{ t('manage') }}</NuxtLink>
      </div>
      <div class="projects-row">
        <div v-if="projects.length === 0" class="empty-card">{{ t('noProjects') }}</div>
        <div v-for="p in projects.slice(0, 6)" :key="p.id" class="proj-pill" :class="projPillClass(p.sev)">
          <span class="pill-name">{{ p.name }}</span>
          <span class="pill-count">{{ p.alertCount || 0 }}</span>
        </div>
      </div>
    </div>

    <!-- Quick actions -->
    <div class="quick-actions">
      <div class="qa-title">{{ t('quickActions') }}</div>
      <div class="qa-row">
        <NuxtLink to="/alerts" class="qa-btn">
          <Icon name="lucide:bell" /> {{ t('viewAlerts') }}
        </NuxtLink>
        <NuxtLink to="/escalation" class="qa-btn">
          <Icon name="lucide:arrow-up-right" /> {{ t('escalationRules') }}
        </NuxtLink>
        <NuxtLink to="/projects" class="qa-btn">
          <Icon name="lucide:monitor" /> {{ t('projects') }}
        </NuxtLink>
        <NuxtLink to="/analytics" class="qa-btn">
          <Icon name="lucide:bar-chart-2" /> {{ t('analytics') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from '~/composables/useI18n'
import { useErrorStore } from '~/composables/useErrorStore'
import { useProjects } from '~/composables/useProjects'

const { t } = useI18n()
const { alerts, loading, apiConnected, loadAlerts } = useErrorStore()
const { projects } = useProjects()

const refreshAll = async () => { await loadAlerts() }

const totalAlerts    = computed(() => alerts.value.length)
const openCount      = computed(() => alerts.value.filter(a => a.status === 'Open').length)
const escalatedCount = computed(() => alerts.value.filter(a => a.status === 'Escalated').length)
const resolvedCount  = computed(() => alerts.value.filter(a => a.status === 'Resolved').length)
const criticalCount  = computed(() => alerts.value.filter(a => a.severity === 'Critical').length)
const resolvedToday  = computed(() => {
  const today = new Date().toDateString()
  return alerts.value.filter(a => a.status === 'Resolved' && new Date(a.createdAt).toDateString() === today).length
})

const urgentAlerts = computed(() =>
  alerts.value.filter(a => a.severity === 'Critical' || a.status === 'Escalated').slice(0, 8)
)

const severityBreakdown = computed(() => {
  const total = Math.max(alerts.value.length, 1)
  return [
    { label: 'Critical', count: alerts.value.filter(a => a.severity === 'Critical').length, color: '#f85149', cls: 'sev-critical-text' },
    { label: 'Error',    count: alerts.value.filter(a => a.severity === 'Error').length,    color: '#e3b341', cls: 'sev-error-text' },
    { label: 'Warning',  count: alerts.value.filter(a => a.severity === 'Warning').length,  color: '#d29922', cls: 'sev-warning-text' },
    { label: 'Info',     count: alerts.value.filter(a => a.severity === 'Info').length,     color: '#58a6ff', cls: 'sev-info-text' },
  ].map(s => ({ ...s, pct: Math.round((s.count / total) * 100) }))
})

const topServices = computed(() => {
  const counts = {}
  alerts.value.forEach(a => { counts[a.service] = (counts[a.service] || 0) + 1 })
  return Object.entries(counts).map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count).slice(0, 5)
})

const formatTime = (dt) => {
  if (!dt) return '—'
  const diff = (Date.now() - new Date(dt)) / 1000
  if (diff < 60) return `${Math.round(diff)}s ago`
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`
  return `${Math.round(diff / 3600)}h ago`
}

const projPillClass = sev => ({
  Critical: 'pill-critical', Error: 'pill-error', Warning: 'pill-warning', Resolved: 'pill-resolved'
}[sev] || '')
</script>

<style scoped>
.page-title { font-size: 22px; font-weight: 700; color: #e6edf3; }
.page-sub   { font-size: 13px; color: #586069; margin-top: 3px; }

.dash-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; }
.header-right { display: flex; align-items: center; gap: 10px; }

.live-badge {
  display: flex; align-items: center; gap: 5px; padding: 4px 10px;
  background: rgba(63,185,80,.12); border: 1px solid rgba(63,185,80,.3); border-radius: 20px;
  font-size: 11px; font-weight: 700; color: #3fb950; letter-spacing: .08em;
}
.live-dot { width: 6px; height: 6px; background: #3fb950; border-radius: 50%; animation: blink 1.5s infinite; }
@keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: .3; } }
.offline-badge { font-size: 11px; color: #f85149; background: rgba(248,81,73,.12); padding: 4px 10px; border-radius: 20px; }

.refresh-btn {
  background: #21262d; border: 1px solid #30363d; border-radius: 6px;
  color: #8b949e; cursor: pointer; padding: 6px 8px; transition: all .15s;
}
.refresh-btn:hover { color: #c9d1d9; border-color: #8b949e; }
.spinning { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

/* KPI */
.kpi-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 20px; }
.kpi-card {
  background: #161b22; border: 1px solid #21262d; border-radius: 12px; padding: 20px;
  display: flex; align-items: flex-start; gap: 14px; cursor: pointer; transition: border-color .15s;
  position: relative; overflow: hidden;
}
.kpi-card:hover { border-color: #30363d; transform: translateY(-1px); }
.kpi-blue   { border-top: 2px solid #58a6ff; }
.kpi-red    { border-top: 2px solid #f85149; }
.kpi-orange { border-top: 2px solid #e3b341; }
.kpi-green  { border-top: 2px solid #3fb950; }

.kpi-icon { font-size: 20px; opacity: .6; margin-top: 2px; }
.kpi-label { font-size: 11px; font-weight: 600; color: #586069; text-transform: uppercase; letter-spacing: .06em; }
.kpi-value { font-size: 36px; font-weight: 700; color: #e6edf3; line-height: 1.1; }
.kpi-sub   { font-size: 12px; color: #586069; margin-top: 2px; }
.kpi-blue   .kpi-value { color: #58a6ff; }
.kpi-red    .kpi-value { color: #f85149; }
.kpi-orange .kpi-value { color: #e3b341; }
.kpi-green  .kpi-value { color: #3fb950; }
.kpi-trend { position: absolute; top: 12px; right: 12px; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 4px; }
.kpi-trend.up { background: rgba(248,81,73,.15); color: #f85149; }

/* Grid */
.dash-grid { display: grid; grid-template-columns: 1fr 340px; gap: 16px; margin-bottom: 16px; }
.dash-card { background: #161b22; border: 1px solid #21262d; border-radius: 12px; padding: 20px; margin-bottom: 0; }

.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.card-title { font-size: 13px; font-weight: 600; color: #e6edf3; }
.card-link { font-size: 12px; color: #58a6ff; text-decoration: none; }
.card-link:hover { text-decoration: underline; }

/* Alert list */
.alert-list { display: flex; flex-direction: column; gap: 8px; }
.empty-card { display: flex; align-items: center; gap: 8px; color: #586069; font-size: 13px; padding: 12px 0; }
.alert-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 12px; border-radius: 8px; border-left: 3px solid transparent;
  background: #0d1117;
}
.item-critical { border-left-color: #f85149; }
.item-escalated { border-left-color: #e3b341; }
.item-left  { display: flex; align-items: center; gap: 8px; overflow: hidden; }
.item-right { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; flex-shrink: 0; margin-left: 12px; }
.item-sev { font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px; }
.badge-critical { background: rgba(248,81,73,.15); color: #f85149; }
.badge-error    { background: rgba(227,179,65,.15); color: #e3b341; }
.item-msg { font-size: 12px; color: #c9d1d9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.item-service { font-size: 11px; color: #58a6ff; font-family: 'Courier New', monospace; }
.item-time    { font-size: 11px; color: #586069; }

/* Severity breakdown */
.sev-breakdown { display: flex; flex-direction: column; gap: 10px; }
.sev-row { display: flex; align-items: center; gap: 10px; }
.sev-label { font-size: 12px; font-weight: 600; min-width: 60px; }
.sev-critical-text { color: #f85149; } .sev-error-text { color: #e3b341; }
.sev-warning-text  { color: #d29922; } .sev-info-text    { color: #58a6ff; }
.sev-bar-track { flex: 1; background: #21262d; border-radius: 3px; height: 8px; overflow: hidden; }
.sev-bar-fill  { height: 100%; border-radius: 3px; transition: width .5s; }
.sev-count { font-size: 12px; color: #586069; min-width: 24px; text-align: right; }

/* Service list */
.service-list { display: flex; flex-direction: column; gap: 8px; }
.service-row { display: flex; align-items: center; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #21262d; }
.service-row:last-child { border-bottom: none; }
.service-name { font-family: 'Courier New', monospace; font-size: 12px; color: #8b949e; }
.service-cnt { font-size: 12px; font-weight: 700; }
.cnt-red    { color: #f85149; }
.cnt-normal { color: #58a6ff; }

/* Projects row */
.projects-row { display: flex; flex-wrap: wrap; gap: 8px; }
.proj-pill {
  display: flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: 8px;
  border: 1px solid #21262d; cursor: pointer; transition: all .15s;
}
.proj-pill:hover { border-color: #30363d; }
.pill-critical { border-left: 3px solid #f85149; }
.pill-error    { border-left: 3px solid #e3b341; }
.pill-warning  { border-left: 3px solid #d29922; }
.pill-resolved { border-left: 3px solid #3fb950; }
.pill-name  { font-family: 'Courier New', monospace; font-size: 13px; color: #c9d1d9; }
.pill-count { background: #21262d; color: #8b949e; font-size: 11px; font-weight: 700; padding: 1px 7px; border-radius: 10px; }

/* Quick actions */
.quick-actions { margin-top: 16px; }
.qa-title { font-size: 11px; font-weight: 600; color: #586069; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 10px; }
.qa-row { display: flex; gap: 10px; }
.qa-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 18px; border-radius: 8px; background: #161b22; border: 1px solid #21262d;
  color: #8b949e; font-size: 13px; text-decoration: none; transition: all .15s;
}
.qa-btn:hover { border-color: #58a6ff; color: #58a6ff; }
.page-wrap { width: 100%; min-width: 0; }
</style>
