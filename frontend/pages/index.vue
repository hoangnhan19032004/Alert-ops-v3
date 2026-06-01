<template>
  <div class="page-wrap">

    <!-- Header -->
    <div class="dash-header">
      <div>
        <h1 class="page-title">{{ t('dashboard') }}</h1>
        <p class="page-sub">{{ t('dashboardSub') }}</p>
      </div>
      <div class="header-right">
        <span v-if="apiConnected" class="status-badge live">
          <span class="live-dot"></span>LIVE
        </span>
        <span v-else class="status-badge offline">{{ t('offline') }}</span>
        <span class="countdown-badge">
          <Icon name="lucide:clock" class="countdown-icon" />
          {{ countdown }}s
        </span>
        <button class="icon-btn" @click="manualRefresh" :disabled="loading" :title="t('refresh') || 'Refresh'">
          <Icon name="lucide:refresh-ccw" :class="{ spinning: loading }" />
        </button>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="kpi-grid">
      <div class="kpi-card" data-color="blue" @click="navigateTo('/alerts')">
        <div class="kpi-top">
          <div class="kpi-icon-wrap blue">
            <Icon name="lucide:activity" />
          </div>
          <span v-if="criticalCount > 0" class="kpi-badge red">{{ criticalCount }} critical</span>
        </div>
        <div class="kpi-value blue">{{ totalAlerts }}</div>
        <div class="kpi-label">{{ t('totalAlerts') }}</div>
        <div class="kpi-sub">{{ openCount }} {{ t('openNow') }}</div>
      </div>

      <div class="kpi-card" data-color="red" @click="navigateTo('/alerts?filter=open')">
        <div class="kpi-top">
          <div class="kpi-icon-wrap red">
            <Icon name="lucide:alert-circle" />
          </div>
        </div>
        <div class="kpi-value red">{{ openCount }}</div>
        <div class="kpi-label">{{ t('open') }}</div>
        <div class="kpi-sub">{{ t('needAttention') }}</div>
      </div>

      <div class="kpi-card" data-color="amber" @click="navigateTo('/alerts?filter=escalated')">
        <div class="kpi-top">
          <div class="kpi-icon-wrap amber">
            <Icon name="lucide:arrow-up-right" />
          </div>
        </div>
        <div class="kpi-value amber">{{ escalatedCount }}</div>
        <div class="kpi-label">{{ t('escalated') }}</div>
        <div class="kpi-sub">{{ t('highPriority') }}</div>
      </div>

      <div class="kpi-card" data-color="green" @click="navigateTo('/alerts?filter=resolved')">
        <div class="kpi-top">
          <div class="kpi-icon-wrap green">
            <Icon name="lucide:check-circle" />
          </div>
        </div>
        <div class="kpi-value green">{{ resolvedCount }}</div>
        <div class="kpi-label">{{ t('resolved') }}</div>
        <div class="kpi-sub">{{ t('last24h') }} {{ resolvedToday }}</div>
      </div>
    </div>

    <!-- 2-column layout -->
    <div class="dash-grid">

      <!-- Critical Alerts -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">{{ t('criticalEscalated') }}</span>
          <NuxtLink to="/alerts" class="card-link">{{ t('viewAll') }} →</NuxtLink>
        </div>
        <div class="alert-list">
          <div v-if="urgentAlerts.length === 0" class="empty-state">
            <Icon name="lucide:check-circle" class="empty-icon" />
            <span>{{ t('noCritical') }}</span>
          </div>
          <div
            v-for="a in urgentAlerts" :key="a.id"
            class="alert-item"
            :class="a.severity === 'Critical' ? 'critical' : 'escalated'"
          >
            <div class="item-left">
              <span class="sev-badge" :class="a.severity === 'Critical' ? 'badge-critical' : 'badge-warning'">
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

      <!-- Right column -->
      <div class="right-col">

        <!-- Severity Breakdown -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">{{ t('bySeverity') }}</span>
          </div>
          <div class="sev-list">
            <div class="sev-row" v-for="sev in severityBreakdown" :key="sev.label">
              <span class="sev-name" :class="`sev-${sev.key}`">{{ sev.label }}</span>
              <div class="sev-track">
                <div class="sev-fill" :class="`fill-${sev.key}`" :style="{ width: sev.pct + '%' }"></div>
              </div>
              <span class="sev-count">{{ sev.count }}</span>
            </div>
          </div>
        </div>

        <!-- Top Services -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">{{ t('topServices') }}</span>
          </div>
          <div class="service-list">
            <div v-if="topServices.length === 0" class="empty-state">
              <span>{{ t('noData') || 'Không có dữ liệu' }}</span>
            </div>
            <div class="service-row" v-for="s in topServices" :key="s.name">
              <div class="service-left">
                <div class="service-bar" :style="{ width: Math.round((s.count / topServices[0].count) * 100) + '%' }"></div>
                <span class="service-name">{{ s.name }}</span>
              </div>
              <span class="service-count" :class="s.count > 5 ? 'cnt-danger' : 'cnt-normal'">{{ s.count }}</span>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Project Health -->
    <div class="card section-gap">
      <div class="card-header">
        <span class="card-title">{{ t('projectsHealth') }}</span>
        <NuxtLink to="/projects" class="card-link">{{ t('manage') }} →</NuxtLink>
      </div>
      <div class="projects-row">
        <div v-if="projects.length === 0" class="empty-state">{{ t('noProjects') }}</div>
        <div
          v-for="p in projects.slice(0, 6)" :key="p.id"
          class="proj-pill"
          :class="projPillClass(p.sev)"
        >
          <span class="pill-dot" :class="projDotClass(p.sev)"></span>
          <span class="pill-name">{{ p.name }}</span>
          <span class="pill-count">{{ p.alertCount || 0 }}</span>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="qa-section">
      <div class="qa-label">{{ t('quickActions') }}</div>
      <div class="qa-row">
        <NuxtLink to="/alerts" class="qa-btn">
          <Icon name="lucide:bell" class="qa-icon" />
          {{ t('viewAlerts') }}
        </NuxtLink>
        <NuxtLink to="/escalation" class="qa-btn">
          <Icon name="lucide:arrow-up-right" class="qa-icon" />
          {{ t('escalationRules') }}
        </NuxtLink>
        <NuxtLink to="/projects" class="qa-btn">
          <Icon name="lucide:monitor" class="qa-icon" />
          {{ t('projects') }}
        </NuxtLink>
        <NuxtLink to="/analytics" class="qa-btn">
          <Icon name="lucide:bar-chart-2" class="qa-icon" />
          {{ t('analytics') }}
        </NuxtLink>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from '~/composables/useI18n'
import { useErrorStore } from '~/composables/useErrorStore'
import { useProjects } from '~/composables/useProjects'

const { t } = useI18n()
const { alerts, loading, apiConnected, loadAlerts } = useErrorStore()
const { projects } = useProjects()

const AUTO_REFRESH_SECONDS = 30
const countdown = ref(AUTO_REFRESH_SECONDS)
let refreshTimer = null
let countdownTimer = null

const doRefresh = async () => {
  if (!loading.value) await loadAlerts()
  countdown.value = AUTO_REFRESH_SECONDS
}

const manualRefresh = async () => {
  countdown.value = AUTO_REFRESH_SECONDS
  clearInterval(refreshTimer)
  clearInterval(countdownTimer)
  await doRefresh()
  startTimers()
}

const startTimers = () => {
  countdownTimer = setInterval(() => {
    countdown.value = Math.max(0, countdown.value - 1)
  }, 1_000)
  refreshTimer = setInterval(doRefresh, AUTO_REFRESH_SECONDS * 1_000)
}

onMounted(async () => {
  await loadAlerts()
  startTimers()
})

onUnmounted(() => {
  clearInterval(refreshTimer)
  clearInterval(countdownTimer)
})

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
    { 
      key: 'critical', 
      label: t('critical'), // Tự động trả về "Nghiêm trọng" hoặc "Critical"
      count: alerts.value.filter(a => a.severity === 'Critical').length 
    },
    { 
      key: 'error',    
      label: t('error'),    // Tự động trả về "Lỗi" hoặc "Error"
      count: alerts.value.filter(a => a.severity === 'Error').length 
    },
    { 
      key: 'warning',  
      label: t('warning'),  // Tự động trả về "Cảnh báo" hoặc "Warning"
      count: alerts.value.filter(a => a.severity === 'Warning').length 
    },
    { 
      key: 'info',     
      label: t('info'),     // Tự động trả về "Thông tin" hoặc "Info"
      count: alerts.value.filter(a => a.severity === 'Info').length 
    },
  ].map(s => ({ ...s, pct: Math.round((s.count / total) * 100) }))
})

const topServices = computed(() => {
  const counts = {}
  alerts.value.forEach(a => { counts[a.service] = (counts[a.service] || 0) + 1 })
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
})

const formatTime = (dt) => {
  if (!dt) return '—'
  const diff = (Date.now() - new Date(dt)) / 1000
  if (diff < 60)   return `${Math.round(diff)}s ago`
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`
  return `${Math.round(diff / 3600)}h ago`
}

const projPillClass = (sev) => ({
  Critical: 'pill-critical', Error: 'pill-error',
  Warning: 'pill-warning', Resolved: 'pill-ok'
}[sev] || '')

const projDotClass = (sev) => ({
  Critical: 'dot-red', Error: 'dot-amber',
  Warning: 'dot-yellow', Resolved: 'dot-green'
}[sev] || 'dot-muted')
</script>

<style scoped>
/* ── CSS Variables ── */
.page-wrap {
  /* Light defaults */
  --bg-card:       #ffffff;
  --bg-surface:    #f6f8fa;
  --bg-hover:      #f0f3f6;
  --border:        #d0d7de;
  --border-subtle: #e8eaed;
  --text-primary:  #1a1f2e;
  --text-muted:    #57606a;
  --text-hint:     #8c959f;

  /* Accent semantic */
  --blue:          #0969da;
  --blue-bg:       #dbeafe;
  --blue-text:     #1d4ed8;
  --red:           #cf222e;
  --red-bg:        #fee2e2;
  --red-text:      #b91c1c;
  --amber:         #b45309;
  --amber-bg:      #fef3c7;
  --amber-text:    #92400e;
  --green:         #1a7f37;
  --green-bg:      #dcfce7;
  --green-text:    #166534;

  --accent:        #0969da;
  --accent-hover:  #0550ae;

  --shadow-card:   0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-hover:  0 4px 12px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06);
}

/* Dark mode overrides */
:root.dark .page-wrap {
  --bg-card:       #161b22;
  --bg-surface:    #21262d;
  --bg-hover:      #2d333b;
  --border:        #30363d;
  --border-subtle: #21262d;
  --text-primary:  #e6edf3;
  --text-muted:    #c9d1d9;
  --text-hint:     #8b949e;

  --blue:          #58a6ff;
  --blue-bg:       #102842;
  --blue-text:     #79c0ff;
  --red:           #f85149;
  --red-bg:        #3d1c1c;
  --red-text:      #ff7b72;
  --amber:         #e3b341;
  --amber-bg:      #3d2e0a;
  --amber-text:    #f0c060;
  --green:         #3fb950;
  --green-bg:      #0f2e16;
  --green-text:    #56d364;

  --accent:        #58a6ff;
  --accent-hover:  #79c0ff;

  --shadow-card:   0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2);
  --shadow-hover:  0 4px 12px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3);
}

/* ── Layout ── */
.page-wrap {
  width: 100%;
  min-width: 0;
}

/* ── Header ── */
.dash-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title {
  font-size: 1.5714rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.page-sub {
  font-size: 0.9286rem;
  color: var(--text-hint);
  margin: 4px 0 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  border-radius: 20px;
  font-size: 0.7857rem;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.status-badge.live {
  background: var(--green-bg);
  color: var(--green);
  border: 1px solid currentColor;
}

.status-badge.offline {
  background: var(--red-bg);
  color: var(--red);
  border: 1px solid currentColor;
}

.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  animation: blink 1.5s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.3; }
}

.countdown-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  font-size: 0.7857rem;
  color: var(--text-hint);
  font-variant-numeric: tabular-nums;
}

.countdown-icon {
  font-size: 0.8571rem;
}

.icon-btn {
  width: 34px;
  height: 34px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-hint);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.0714rem;
  transition: all 0.15s;
}

.icon-btn:hover {
  color: var(--text-muted);
  border-color: var(--text-hint);
}

.icon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* ── KPI Grid ── */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.kpi-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 18px 20px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: var(--shadow-card);
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
  border-color: var(--accent);
}

.kpi-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.kpi-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2143rem;
}

.kpi-icon-wrap.blue   { background: var(--blue-bg);  color: var(--blue-text); }
.kpi-icon-wrap.red    { background: var(--red-bg);   color: var(--red-text);  }
.kpi-icon-wrap.amber  { background: var(--amber-bg); color: var(--amber-text);}
.kpi-icon-wrap.green  { background: var(--green-bg); color: var(--green-text);}

.kpi-badge {
  font-size: 0.7143rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
}

.kpi-badge.red {
  background: var(--red-bg);
  color: var(--red-text);
}

.kpi-value {
  font-size: 2.4286rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 4px;
}

.kpi-value.blue  { color: var(--blue);  }
.kpi-value.red   { color: var(--red);   }
.kpi-value.amber { color: var(--amber); }
.kpi-value.green { color: var(--green); }

.kpi-label {
  font-size: 0.8571rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 2px;
}

.kpi-sub {
  font-size: 0.7857rem;
  color: var(--text-hint);
}

/* ── Dash Grid ── */
.dash-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 16px;
  margin-bottom: 16px;
}

.right-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── Card ── */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 18px 20px;
  box-shadow: var(--shadow-card);
}

.section-gap {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.card-title {
  font-size: 0.9286rem;
  font-weight: 700;
  color: var(--text-primary);
}

.card-link {
  font-size: 0.8571rem;
  color: var(--accent);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.15s;
}

.card-link:hover {
  color: var(--accent-hover);
}

/* ── Alert list ── */
.alert-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.empty-state {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-hint);
  font-size: 0.9286rem;
  padding: 12px 0;
}

.empty-icon {
  font-size: 1.2857rem;
  color: var(--green);
}

.alert-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 12px;
  border-radius: 8px;
  border-left: 3px solid transparent;
  background: var(--bg-surface);
  transition: background 0.15s;
}

.alert-item:hover {
  background: var(--bg-hover);
}

.alert-item.critical  { border-left-color: var(--red);   }
.alert-item.escalated { border-left-color: var(--amber); }

.item-left {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
}

.item-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  flex-shrink: 0;
  margin-left: 12px;
}

.sev-badge {
  font-size: 0.7143rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 5px;
  flex-shrink: 0;
}

.badge-critical {
  background: var(--red-bg);
  color: var(--red-text);
}

.badge-warning {
  background: var(--amber-bg);
  color: var(--amber-text);
}

.item-msg {
  font-size: 0.8571rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-service {
  font-size: 0.7857rem;
  color: var(--accent);
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.item-time {
  font-size: 0.7857rem;
  color: var(--text-hint);
}

/* ── Severity breakdown ── */
.sev-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sev-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sev-name {
  font-size: 0.8571rem;
  font-weight: 600;
  min-width: 58px;
}

.sev-critical { color: var(--red);   }
.sev-error    { color: var(--amber); }
.sev-warning  { color: #b45309; }
.sev-info     { color: var(--blue);  }

.sev-track {
  flex: 1;
  height: 6px;
  background: var(--bg-surface);
  border-radius: 3px;
  overflow: hidden;
  border: 1px solid var(--border-subtle);
}

.sev-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}

.fill-critical { background: var(--red);   }
.fill-error    { background: var(--amber); }
.fill-warning  { background: #d29922; }
.fill-info     { background: var(--blue);  }

.sev-count {
  font-size: 0.8571rem;
  color: var(--text-hint);
  min-width: 22px;
  text-align: right;
  font-weight: 600;
}

/* ── Service list ── */
.service-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.service-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.service-left {
  position: relative;
  flex: 1;
  overflow: hidden;
}

.service-bar {
  position: absolute;
  inset: 0;
  background: var(--bg-surface);
  border-radius: 4px;
  transition: width 0.4s ease;
}

.service-name {
  position: relative;
  font-size: 0.8571rem;
  color: var(--text-muted);
  font-family: 'SF Mono', 'Fira Code', monospace;
  padding: 4px 8px;
  display: block;
}

.service-count {
  font-size: 0.8571rem;
  font-weight: 700;
  flex-shrink: 0;
}

.cnt-danger { color: var(--red);   }
.cnt-normal { color: var(--blue);  }

/* ── Projects ── */
.projects-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.proj-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
}

.proj-pill:hover {
  border-color: var(--accent);
  background: var(--bg-hover);
}

.pill-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-red    { background: var(--red);   }
.dot-amber  { background: var(--amber); }
.dot-yellow { background: #d29922;      }
.dot-green  { background: var(--green); }
.dot-muted  { background: var(--text-hint); }

.pill-name {
  font-size: 0.9286rem;
  color: var(--text-muted);
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.pill-count {
  font-size: 0.7857rem;
  font-weight: 700;
  background: var(--bg-hover);
  color: var(--text-hint);
  padding: 2px 8px;
  border-radius: 10px;
}

/* ── Quick Actions ── */
.qa-section {
  margin-top: 16px;
}

.qa-label {
  font-size: 0.7857rem;
  font-weight: 700;
  color: var(--text-hint);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 10px;
}

.qa-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.qa-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 9px;
  color: var(--text-muted);
  font-size: 0.9286rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.15s;
  box-shadow: var(--shadow-card);
}

.qa-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--bg-surface);
}

.qa-icon {
  font-size: 1.0714rem;
}
</style>