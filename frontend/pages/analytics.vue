<template>
  <div class="page-wrap">
    <div class="page-header">
      <h1 class="page-title">{{ t('analyticsTitle') }}</h1>
      <div class="header-right">
        <select class="time-select" v-model="timeRange">
          <option value="7">{{ t('last7days') }}</option>
          <option value="14">{{ t('last14days') }}</option>
          <option value="30">{{ t('last30days') }}</option>
        </select>
      </div>
    </div>

    <!-- KPI stats -->
    <div class="stats-grid">
      <div class="stat-card c-blue">
        <div class="stat-label">{{ t('totalAlerts') }}</div>
        <div class="stat-value blue">{{ totalAlerts }}</div>
        <div class="stat-sub">{{ ackCount }} {{ t('ackCount') }}</div>
      </div>
      <div class="stat-card c-red">
        <div class="stat-label">{{ t('open') }}</div>
        <div class="stat-value red">{{ openCount }}</div>
        <div class="stat-sub">{{ criticalCount }} {{ t('criticalCount') }}</div>
      </div>
      <div class="stat-card c-orange">
        <div class="stat-label">{{ t('escalated') }}</div>
        <div class="stat-value orange">{{ escalatedCount }}</div>
        <div class="stat-sub">{{ t('needAttention') }}</div>
      </div>
      <div class="stat-card c-green">
        <div class="stat-label">{{ t('resolved') }}</div>
        <div class="stat-value green">{{ resolvedCount }}</div>
        <div class="stat-sub">{{ resolveRate }}% {{ t('resolveRate') }}</div>
      </div>
    </div>

    <ClientOnly>
      <!-- Trend + Donut row -->
      <div class="charts-row">
        <div class="chart-card">
          <div class="chart-title">Alert Trend — Last {{ timeRange }} Days</div>
          <div class="chart-wrap">
            <canvas ref="trendRef"></canvas>
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-title">{{ t('byStatus') }}</div>
          <div class="donut-wrap">
            <canvas ref="donutRef"></canvas>
          </div>
        </div>
      </div>

      <!-- Severity stacked bar chart -->
      <div class="chart-card">
        <div class="chart-title">Severity Distribution — Last {{ timeRange }} Days (Stacked)</div>
        <div class="chart-wrap">
          <canvas ref="stackedRef"></canvas>
        </div>
      </div>
    </ClientOnly>

    <!-- Env breakdown -->
    <div class="charts-row-2">
      <div class="chart-card">
        <div class="chart-title">{{ t('byEnvironment') }}</div>
        <div class="env-breakdown">
          <div class="env-row">
            <span class="env-label prod">{{ t('production') }}</span>
            <div class="bar-track">
              <div class="bar-fill" :style="{ width: envProd.pct + '%', background: '#f85149' }"></div>
            </div>
            <span class="env-count">{{ envProd.count }}</span>
          </div>
          <div class="env-row">
            <span class="env-label staging">{{ t('staging') }}</span>
            <div class="bar-track">
              <div class="bar-fill" :style="{ width: envStaging.pct + '%', background: '#d29922' }"></div>
            </div>
            <span class="env-count">{{ envStaging.count }}</span>
          </div>
        </div>
      </div>

      <div class="chart-card">
        <div class="chart-title">{{ t('byProject') }}</div>
        <div class="bar-list">
          <div v-for="b in barData" :key="b.name" class="bar-row">
            <div class="bar-label">{{ b.name }}</div>
            <div class="bar-track">
              <div class="bar-fill" :style="{ width: b.pct + '%', background: b.color }"></div>
            </div>
            <span class="bar-count">{{ b.count }}</span>
          </div>
          <div v-if="barData.length === 0" class="empty-state">{{ t('noProjectData') }}</div>
        </div>
      </div>

      <!-- Top alerting services -->
      <div class="chart-card">
        <div class="chart-title">{{ t('topServices') }}</div>
        <div class="service-list">
          <div v-for="(s, i) in topServices" :key="s.name" class="service-row">
            <span class="rank">#{{ i+1 }}</span>
            <span class="svc-name">{{ s.name }}</span>
            <div class="svc-bar-track">
              <div class="svc-bar-fill" :style="{ width: s.pct + '%' }"></div>
            </div>
            <span class="svc-count" :class="s.count > 3 ? 'cnt-red' : 'cnt-blue'">{{ s.count }}</span>
          </div>
          <div v-if="topServices.length === 0" class="empty-state">{{ t('noData2') }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from '~/composables/useI18n'
const { t } = useI18n()
import { ref, onMounted, watch, computed } from 'vue'

const { alerts, loadAlerts } = useErrorStore()
const { projects, loadProjects } = useProjects()

const trendRef   = ref(null)
const donutRef   = ref(null)
const stackedRef = ref(null)
let trendChart = null, donutChart = null, stackedChart = null

const timeRange = ref(7)

// Auto-reload data when entering the page
onMounted(async () => {
  await loadAlerts()
  await loadProjects()
})

// ─── KPI ───
const totalAlerts    = computed(() => alerts.value.length)
const openCount      = computed(() => alerts.value.filter(a => a.status === 'Open').length)
const ackCount       = computed(() => alerts.value.filter(a => a.status === 'Acknowledged').length)
const escalatedCount = computed(() => alerts.value.filter(a => a.status === 'Escalated').length)
const resolvedCount  = computed(() => alerts.value.filter(a => a.status === 'Resolved').length)
const criticalCount  = computed(() => alerts.value.filter(a => a.severity === 'Critical').length)
const resolveRate    = computed(() => {
  const t = totalAlerts.value; return t > 0 ? Math.round((resolvedCount.value / t) * 100) : 0
})

// ─── Env ───
const envProd = computed(() => {
  const c = alerts.value.filter(a => a.env === 'Production').length
  return { count: c, pct: totalAlerts.value > 0 ? Math.round(c / totalAlerts.value * 100) : 0 }
})
const envStaging = computed(() => {
  const c = alerts.value.filter(a => a.env === 'Staging').length
  return { count: c, pct: totalAlerts.value > 0 ? Math.round(c / totalAlerts.value * 100) : 0 }
})

// ─── Top services ───
const topServices = computed(() => {
  const counts = {}
  alerts.value.forEach(a => { counts[a.service || 'unknown'] = (counts[a.service || 'unknown'] || 0) + 1 })
  const max = Math.max(...Object.values(counts), 1)
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count, pct: Math.round((count / max) * 100) }))
    .sort((a, b) => b.count - a.count).slice(0, 7)
})

// ─── Projects bar ───
const barData = computed(() => {
  const items = projects.value.map(p => ({ name: p.name, count: p.alertCount ?? 0 }))
  const max = Math.max(...items.map(i => i.count), 1)
  return items.map(i => ({ ...i, pct: Math.round((i.count / max) * 100), color: i.count > 3 ? '#f85149' : '#3fb950' }))
})

// ─── Trend data ───
const trendLabels = computed(() => {
  const labels = []
  for (let i = timeRange.value - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
  }
  return labels
})

const trendData = computed(() => {
  const now = new Date()
  return Array.from({ length: timeRange.value }, (_, idx) => {
    const target = new Date(now)
    target.setDate(now.getDate() - (timeRange.value - 1 - idx))
    const dayKey = target.toISOString().slice(0, 10)
    return alerts.value.filter(a => a.createdAt && new Date(a.createdAt).toISOString().slice(0, 10) === dayKey).length
  })
})

const buildTrendData = (status) => {
  const now = new Date()
  return Array.from({ length: timeRange.value }, (_, idx) => {
    const target = new Date(now)
    target.setDate(now.getDate() - (timeRange.value - 1 - idx))
    const dayKey = target.toISOString().slice(0, 10)
    return alerts.value.filter(a => a.status === status && a.createdAt && new Date(a.createdAt).toISOString().slice(0, 10) === dayKey).length
  })
}

// Stacked severity per day
const buildStackedData = (sev) => {
  const now = new Date()
  return Array.from({ length: timeRange.value }, (_, idx) => {
    const target = new Date(now); target.setDate(now.getDate() - (timeRange.value - 1 - idx))
    const dayKey = target.toISOString().slice(0, 10)
    return alerts.value.filter(a => a.severity === sev && a.createdAt && new Date(a.createdAt).toISOString().slice(0, 10) === dayKey).length
  })
}

// ─── Chart creation ───
const createCharts = async () => {
  if (!trendRef.value || !donutRef.value || !stackedRef.value) return
  const { default: Chart } = await import('chart.js/auto')

  // Destroy existing
  ;[trendChart, donutChart, stackedChart].forEach(c => c?.destroy())

  const gridColor = '#21262d', tickColor = '#586069'

  trendChart = new Chart(trendRef.value, {
    type: 'line',
    data: {
      labels: trendLabels.value,
      datasets: [
        {
          label: 'Open', data: buildTrendData('Open'),
          borderColor: '#f85149', backgroundColor: 'rgba(248,81,73,0.1)',
          tension: 0.4, fill: true, pointBackgroundColor: '#f85149', pointRadius: 4
        },
        {
          label: 'Acknowledged', data: buildTrendData('Acknowledged'),
          borderColor: '#e3b341', backgroundColor: 'rgba(227,179,65,0.1)',
          tension: 0.4, fill: true, pointBackgroundColor: '#e3b341', pointRadius: 4
        },
        {
          label: 'Escalated', data: buildTrendData('Escalated'),
          borderColor: '#d29922', backgroundColor: 'rgba(210,153,34,0.1)',
          tension: 0.4, fill: true, pointBackgroundColor: '#d29922', pointRadius: 4
        },
        {
          label: 'Resolved', data: buildTrendData('Resolved'),
          borderColor: '#3fb950', backgroundColor: 'rgba(63,185,80,0.1)',
          tension: 0.4, fill: true, pointBackgroundColor: '#3fb950', pointRadius: 4
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: true, labels: { color: '#8b949e' } },
        tooltip: { mode: 'index', intersect: false }
      },
      scales: {
        x: { ticks: { color: tickColor }, grid: { color: gridColor } },
        y: { ticks: { color: tickColor }, grid: { color: gridColor }, beginAtZero: true }
      }
    }
  })

  donutChart = new Chart(donutRef.value, {
    type: 'doughnut',
    data: {
      labels: ['Open', 'Acknowledged', 'Escalated', 'Resolved'],
      datasets: [{
        data: [
          openCount.value,
          ackCount.value,
          escalatedCount.value,
          resolvedCount.value
        ],
        backgroundColor: [
          '#f85149',
          '#e3b341',
          '#d29922',
          '#3fb950'
        ],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',

      plugins: {
        legend: {
          display: true,
          position: 'bottom',

          labels: {
            color: '#8b949e',
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 16
          },

          // ✅ Click để ẩn / hiện
          onClick(e, legendItem, legend) {
            const index = legendItem.index
            const chart = legend.chart

            chart.toggleDataVisibility(index)
            chart.update()
          }
        },

        tooltip: {
          callbacks: {
            label(context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0)
              const value = context.raw
              const pct = total > 0
                ? Math.round((value / total) * 100)
                : 0

              return `${context.label}: ${value} (${pct}%)`
            }
          }
        }
      }
    }
  })

  stackedChart = new Chart(stackedRef.value, {
    type: 'bar',
    data: {
      labels: trendLabels.value,
      datasets: [
        { label: 'Critical', data: buildStackedData('Critical'), backgroundColor: '#f85149' },
        { label: 'Error',    data: buildStackedData('Error'),    backgroundColor: '#e3b341' },
        { label: 'Warning',  data: buildStackedData('Warning'),  backgroundColor: '#d29922' },
        { label: 'Info',     data: buildStackedData('Info'),     backgroundColor: '#58a6ff' },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#8b949e', boxWidth: 12 } }, tooltip: { mode: 'index' } },
      scales: {
        x: { stacked: true, ticks: { color: tickColor }, grid: { color: gridColor } },
        y: { stacked: true, ticks: { color: tickColor }, grid: { color: gridColor }, beginAtZero: true }
      }
    }
  })
}

const refreshCharts = () => {
  if (trendChart) {
    trendChart.data.labels = trendLabels.value
    trendChart.data.datasets[0].data = buildTrendData('Open')
    trendChart.data.datasets[1].data = buildTrendData('Acknowledged')
    trendChart.data.datasets[2].data = buildTrendData('Escalated')
    trendChart.data.datasets[3].data = buildTrendData('Resolved')
    trendChart.update()
  }
  if (donutChart) {
    donutChart.data.datasets[0].data = [openCount.value, ackCount.value, escalatedCount.value, resolvedCount.value]
    donutChart.update()
  }
  if (stackedChart) {
    stackedChart.data.labels = trendLabels.value
    stackedChart.data.datasets[0].data = buildStackedData('Critical')
    stackedChart.data.datasets[1].data = buildStackedData('Error')
    stackedChart.data.datasets[2].data = buildStackedData('Warning')
    stackedChart.data.datasets[3].data = buildStackedData('Info')
    stackedChart.update()
  }
}

onMounted(async () => { await createCharts() })
watch([alerts, projects, timeRange], async () => {
  if (trendChart && donutChart && stackedChart) refreshCharts()
  else await createCharts()
})
</script>

<style scoped>
.page-title { font-size: 22px; font-weight: 700; color: #e6edf3; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; }
.header-right { display: flex; align-items: center; gap: 10px; }
.time-select {
  padding: 7px 12px; border-radius: 6px; border: 1px solid #30363d;
  background: #161b22; color: #8b949e; font-size: 13px; cursor: pointer;
}

.stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 20px; }
.stat-card { background: #161b22; border: 1px solid #21262d; border-radius: 10px; padding: 20px 22px; }
.stat-card.c-blue   { border-top: 2px solid #58a6ff; }
.stat-card.c-red    { border-top: 2px solid #f85149; }
.stat-card.c-orange { border-top: 2px solid #e3b341; }
.stat-card.c-green  { border-top: 2px solid #3fb950; }
.stat-label { font-size: 11px; font-weight: 600; color: #586069; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 8px; }
.stat-value { font-size: 36px; font-weight: 700; }
.stat-value.blue   { color: #58a6ff; } .stat-value.red    { color: #f85149; }
.stat-value.orange { color: #e3b341; } .stat-value.green  { color: #3fb950; }
.stat-sub { font-size: 12px; color: #586069; margin-top: 4px; }

.charts-row   { display: grid; grid-template-columns: 1fr 300px; gap: 16px; margin-bottom: 16px; }
.charts-row-2 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
.chart-card { background: #161b22; border: 1px solid #21262d; border-radius: 10px; padding: 20px; margin-bottom: 16px; }
.chart-title { font-size: 11px; font-weight: 600; color: #586069; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 16px; }
.chart-wrap { position: relative; height: 200px; }
.donut-wrap { position: relative; height: 240px; width: 240px; margin: 0 auto; }
.legend { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 12px; }
.leg-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #8b949e; }
.leg-dot { width: 8px; height: 8px; border-radius: 50%; }

/* Env breakdown */
.env-breakdown { display: flex; flex-direction: column; gap: 16px; }
.env-row { display: flex; align-items: center; gap: 10px; }
.env-label { font-size: 12px; font-weight: 600; min-width: 80px; }
.env-label.prod    { color: #f85149; }
.env-label.staging { color: #d29922; }
.bar-track { flex: 1; background: #21262d; border-radius: 3px; height: 10px; overflow: hidden; }
.bar-fill  { height: 100%; border-radius: 3px; transition: width .5s; }
.env-count { font-size: 12px; color: #586069; min-width: 30px; text-align: right; }

/* Project bars */
.bar-list { display: flex; flex-direction: column; gap: 10px; }
.bar-row { display: flex; align-items: center; gap: 8px; }
.bar-label { font-family: 'Courier New', monospace; font-size: 11px; color: #8b949e; min-width: 100px; text-align: right; }
.bar-count { font-size: 11px; color: #586069; min-width: 24px; text-align: right; }

/* Service list */
.service-list { display: flex; flex-direction: column; gap: 10px; }
.service-row { display: flex; align-items: center; gap: 8px; }
.rank { font-size: 11px; color: #586069; min-width: 20px; }
.svc-name { font-family: 'Courier New', monospace; font-size: 11px; color: #8b949e; min-width: 90px; }
.svc-bar-track { flex: 1; background: #21262d; border-radius: 3px; height: 8px; overflow: hidden; }
.svc-bar-fill  { height: 100%; background: #58a6ff; border-radius: 3px; transition: width .4s; }
.svc-count { font-size: 12px; font-weight: 700; min-width: 24px; text-align: right; }
.cnt-red  { color: #f85149; }
.cnt-blue { color: #58a6ff; }

.empty-state { font-size: 12px; color: #586069; text-align: center; padding: 16px 0; }
.page-wrap { width: 100%; min-width: 0; }
</style>
