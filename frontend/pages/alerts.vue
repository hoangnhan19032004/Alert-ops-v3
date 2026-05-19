<template>
  <div class="page-wrap">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('alertsTitle') }}</h1>
        <p class="page-sub">
          {{ filteredAlerts.length }} / {{ alerts.length }} alerts
          <span v-if="!apiConnected" class="connection-status offline">• Offline</span>
          <span v-else class="connection-status online">• Live</span>
        </p>
      </div>
      <div class="header-actions">
        <button v-if="!apiConnected" @click="refetchAlerts" class="retry-btn" :disabled="loading">
          <Icon name="lucide:refresh-ccw" /> {{ t('retry') }}
        </button>
        <button class="add-alert-btn" @click="showCreateModal = true">
          <Icon name="lucide:plus" /> {{ t('newAlert') }}
        </button>
        <input class="search-box" v-model="search" :placeholder="t('searchAlerts')" />
      </div>
    </div>

    <!-- Bulk Actions Bar -->
    <AlertActionsBar
      v-if="true"
      :selectedCount="selectedIds.size"
      :selectedAlerts="selectedAlertObjects"
      :alerts="filteredAlerts"
      @clearSelection="selectedIds.clear()"
      @bulkDelete="handleBulkDelete"
      @bulkResolve="handleBulkResolve"
    />

    <!-- Bulk Acknowledge / Escalate -->
    <div v-if="selectedIds.size > 0" class="bulk-ack-row">
      <button class="ack-btn" @click="handleBulkAcknowledge">
        <Icon name="lucide:clock" /> Acknowledge ({{ selectedIds.size }})
      </button>
      <button class="esc-btn" @click="handleBulkEscalate">
        <Icon name="lucide:arrow-up-right" /> Escalate ({{ selectedIds.size }})
      </button>
    </div>

    <!-- Filter Tabs -->
    <div class="filter-bar">
      <div class="filter-tabs">
        <button
          v-for="tab in tabs" :key="tab.key"
          class="tab-btn" :class="{ active: activeFilter === tab.key }"
          @click="activeFilter = tab.key"
        >{{ tab.label }} <span class="tab-count">{{ tab.count }}</span></button>
      </div>

      <div class="filter-right">
        <select class="filter-select" v-model="severityFilter">
          <option value="all">{{ t('allSeverities') }}</option>
          <option value="Critical">{{ t('critical') }}</option>
          <option value="Error">{{ t('error') }}</option>
          <option value="Warning">{{ t('warning') }}</option>
          <option value="Info">{{ t('info') }}</option>
        </select>
        <select class="filter-select" v-model="envFilter">
          <option value="all">{{ t('allEnvs') }}</option>
          <option value="Production">{{ t('production') }}</option>
          <option value="Staging">{{ t('staging') }}</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <table v-if="!loading" class="alerts-table">
      <thead>
        <tr>
          <th class="col-check">
            <input type="checkbox" @change="toggleSelectAll" :checked="allSelected" />
          </th>
          <th @click="toggleSort('id')" class="sortable">
            ID <Icon name="lucide:arrow-up-down" class="sort-icon" />
          </th>
          <th @click="toggleSort('projectId')" class="sortable">
            PROJECT <Icon name="lucide:arrow-up-down" class="sort-icon" />
          </th>
          <th @click="toggleSort('severity')" class="sortable">
            SEVERITY <Icon name="lucide:arrow-up-down" class="sort-icon" />
          </th>
          <th @click="toggleSort('status')" class="sortable">
            STATUS <Icon name="lucide:arrow-up-down" class="sort-icon" />
          </th>
          <th>{{ t('message').toUpperCase() }}</th>
          <th @click="toggleSort('service')" class="sortable">
            SERVICE <Icon name="lucide:arrow-up-down" class="sort-icon" />
          </th>
          <th>{{ t('environment').toUpperCase().slice(0,3) }}</th>
          <th @click="toggleSort('createdAt')" class="sortable">
            TIME <Icon name="lucide:arrow-up-down" class="sort-icon" />
          </th>
          <th>{{ t('actions').toUpperCase() }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="alert in paginatedAlerts"
          :key="alert.id || alert.time || alert.message"
          class="alert-row"
          :class="[severityRowClass(alert.severity), isSelected(alert.id) ? 'row-selected' : '']"
          @click.self="openDetail(alert)"
        >
          <td class="col-check" @click.stop>
            <input type="checkbox" :checked="isSelected(alert.id)" @change="toggleSelect(alert.id)" />
          </td>

          <td @click="openDetail(alert)">
            <span class="alert-id">{{ alert.id?.slice(-6) ?? ' ' }}</span>
          </td>

          <!-- PROJECT BADGE — clickable -->
          <td @click.stop>
            <span
              class="project-badge"
              :class="{ 'project-badge-link': getProjectId(alert.projectId) }"
              @click="goToProject(alert.projectId)"
            >
              <Icon v-if="getProjectId(alert.projectId)" name="lucide:folder" class="badge-folder-icon" />
              {{ getProjectName(alert.projectId) }}
            </span>
          </td>

          <td @click="openDetail(alert)">
            <span class="badge" :class="severityBadgeClass(alert.severity)">
              <span class="badge-dot"></span>
              {{ alert.severity }}
            </span>
          </td>

          <td @click.stop>
            <select
              class="status-select"
              :class="statusSelectClass(alert.status)"
              :value="alert.status"
              @change="onStatusChange(alert, $event)"
            >
              <option value="Open">{{ t('open') }}</option>
              <option value="Acknowledged">{{ t('acknowledged') }}</option>
              <option value="Escalated">{{ t('escalated') }}</option>
              <option value="Resolved">{{ t('resolved') }}</option>
            </select>
          </td>

          <td class="msg-text" @click="openDetail(alert)">{{ alert.message }}</td>

          <td @click="openDetail(alert)">
            <span class="service-text">{{ alert.service }}</span>
          </td>

          <td @click="openDetail(alert)">
            <span class="env-badge" :class="envClass(alert.env)">{{ alert.env }}</span>
          </td>

          <td class="time-text" @click="openDetail(alert)">{{ formatTime(alert.createdAt) }}</td>

          <td class="actions-col" @click.stop>
            <button class="row-action-btn" :title="t('viewDetail')" @click="openDetail(alert)">
              <Icon name="lucide:external-link" />
            </button>
            <button class="row-action-btn danger" :title="t('delete')" @click="deleteSingle(alert.id)">
              <Icon name="lucide:trash-2" />
            </button>
          </td>
        </tr>

        <tr v-if="paginatedAlerts.length === 0">
          <td colspan="10" class="empty-state">{{ t('noAlertsMatch') }}</td>
        </tr>
      </tbody>
    </table>

    <div v-else class="loading-state">
      <Icon name="lucide:loader-2" class="loading-icon" />
      <p>{{ t('loadingAlerts') }}</p>
    </div>

    <!-- Pagination -->
    <div v-if="!loading && totalPages > 1" class="pagination">
      <button class="page-btn" @click="currentPage--" :disabled="currentPage === 1">‹</button>
      <span class="page-info">Page {{ currentPage }} / {{ totalPages }}</span>
      <button class="page-btn" @click="currentPage++" :disabled="currentPage === totalPages">›</button>
      <select class="page-size-select" v-model.number="pageSize">
        <option :value="10">10 / page</option>
        <option :value="25">25 / page</option>
        <option :value="50">50 / page</option>
      </select>
    </div>

    <!-- Detail Panel -->
    <Teleport to="body">
      <div v-if="detailAlert" class="detail-overlay" @click.self="detailAlertId = null">
        <div class="detail-panel">
          <div class="detail-header">
            <div>
              <div class="detail-id">Alert #{{ detailAlert.id?.slice(-6) }}</div>
              <div class="detail-service">{{ detailAlert.service }}</div>
            </div>
            <button class="close-btn" @click="detailAlertId = null">✕</button>
          </div>

          <div class="detail-body">
            <div class="detail-section">
              <div class="detail-label">{{ t('project') }}</div>
              <span
                class="project-badge"
                :class="{ 'project-badge-link': getProjectId(detailAlert.projectId) }"
                @click="goToProject(detailAlert.projectId); detailAlertId = null"
              >
                <Icon v-if="getProjectId(detailAlert.projectId)" name="lucide:folder" class="badge-folder-icon" />
                {{ getProjectName(detailAlert.projectId) }}
              </span>
            </div>

            <div class="detail-section">
              <div class="detail-label">{{ t('severity') }}</div>
              <span class="badge" :class="severityBadgeClass(detailAlert.severity)">
                <span class="badge-dot"></span>
                {{ detailAlert.severity }}
              </span>
            </div>

            <div class="detail-section">
              <div class="detail-label">{{ t('status') }}</div>
              <span :class="statusClass(detailAlert.status)">{{ detailAlert.status }}</span>
            </div>

            <div class="detail-section">
              <div class="detail-label">{{ t('environment') }}</div>
              <span class="env-badge" :class="envClass(detailAlert.env)">{{ detailAlert.env }}</span>
            </div>

            <div class="detail-section full">
              <div class="detail-label">{{ t('message') }}</div>
              <div class="detail-message">{{ detailAlert.message }}</div>
            </div>

            <div class="detail-section">
              <div class="detail-label">{{ t('createdAt') }}</div>
              <div class="detail-value">{{ formatTimeFull(detailAlert.createdAt) }}</div>
            </div>

            <div class="detail-section full">
              <div class="detail-label">{{ t('statusHistory') }}</div>
              <div class="timeline">
                <div class="timeline-item" v-for="ev in getTimeline(detailAlert)" :key="ev.label">
                  <div class="tl-dot" :class="ev.color"></div>
                  <div class="tl-info">
                    <span class="tl-label">{{ ev.label }}</span>
                    <span class="tl-time">{{ ev.time }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="detail-actions">
              <button class="da-btn ack" @click="changeStatus(detailAlert, 'Acknowledged'); detailAlertId = null">
                <Icon name="lucide:clock" /> Acknowledge
              </button>
              <button class="da-btn esc" @click="changeStatus(detailAlert, 'Escalated'); detailAlertId = null">
                <Icon name="lucide:arrow-up-right" /> Escalate
              </button>
              <button class="da-btn res" @click="changeStatus(detailAlert, 'Resolved'); detailAlertId = null">
                <Icon name="lucide:check" /> Resolve
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Create Alert Modal -->
    <Teleport to="body">
      <div v-if="showCreateModal" class="detail-overlay" @click.self="showCreateModal = false">
        <div class="create-modal">
          <div class="detail-header">
            <div class="detail-id">{{ t('createNewAlert') }}</div>
            <button class="close-btn" @click="showCreateModal = false">✕</button>
          </div>

          <div class="create-form">
            <label>{{ t('alertMessage') }}</label>
            <input v-model="newAlert.message" class="form-input" :placeholder="t('alertMessagePh')" />

            <label>{{ t('serviceName') }}</label>
            <input v-model="newAlert.service" class="form-input" placeholder="service-name" />

            <label>{{ t('project') }}</label>
            <select v-model="newAlert.projectId" class="form-input">
              <option disabled value="">{{ t('selectProject') }}</option>
              <option v-for="p in projects" :key="p.id || p._id || p.name" :value="p.id || p._id || p.name">
                {{ p.name }}
              </option>
            </select>

            <label>{{ t('severity') }}</label>
            <select v-model="newAlert.severity" class="form-input">
              <option value="Critical">{{ t('critical') }}</option>
              <option value="Error">{{ t('error') }}</option>
              <option value="Warning">{{ t('warning') }}</option>
              <option value="Info">{{ t('info') }}</option>
            </select>

            <label>{{ t('environment') }}</label>
            <select v-model="newAlert.env" class="form-input">
              <option value="Production">{{ t('production') }}</option>
              <option value="Staging">{{ t('staging') }}</option>
            </select>

            <div class="create-actions">
              <button class="cancel-btn" @click="showCreateModal = false">{{ t('cancel') }}</button>
              <button
                class="submit-btn"
                @click="submitCreate"
                :disabled="!newAlert.message || !newAlert.service || !newAlert.projectId"
              >
                {{ t('createAlert') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type {
  Alert,
  AlertStatus
} from '~/types'

import { useI18n } from '~/composables/useI18n'

const { t } = useI18n()
const router = useRouter()

// ✅ SIGNALR PLUGIN
const { $signalr } = useNuxtApp()

// ─────────────────────────────────────────────
// Stores / Composables
// ─────────────────────────────────────────────
const {
  alerts,
  loading,
  apiConnected,
  loadAlerts,
  updateAlert,
  createAlert,
  deleteAlert
} = useErrorStore()

const {
  success,
  error: showError
} = useToast()

// ─────────────────────────────────────────────
// Projects
// ─────────────────────────────────────────────
const availableProjects = useProjects()
const projects = availableProjects.projects

const getProjectId = (
  projectId: string | null | undefined
) => {
  if (!projectId) return null

  const id = String(projectId)

  const found = projects.value.find((p: any) =>
    String(p.id) === id ||
    String(p._id) === id
  )

  return found?.id ?? found?._id ?? null
}

const getProjectName = (
  projectId: string | null | undefined
) => {
  if (!projectId) return '—'

  const id = String(projectId)

  const project = projects.value.find((p: any) =>
    String(p.id) === id ||
    String(p._id) === id
  )

  return project?.name ?? '—'
}

// Navigate project detail
const goToProject = (
  projectId: string | null | undefined
) => {
  const id = getProjectId(projectId)

  if (id) {
    router.push(`/projects/${id}`)
  }
}

// ─────────────────────────────────────────────
// State
// ─────────────────────────────────────────────
const search = ref('')

const activeFilter = ref('all')
const severityFilter = ref('all')
const envFilter = ref('all')

const sortField = ref('createdAt')
const sortDir = ref('desc')

const selectedIds = ref(
  new Set<string>()
)

const detailAlertId = ref<
  string | null
>(null)

const detailAlert = computed(() => {
  if (!detailAlertId.value) {
    return null
  }

  return (
    alerts.value.find(
      (a: any) =>
        a.id === detailAlertId.value
    ) ?? null
  )
})

const showCreateModal = ref(false)

const currentPage = ref(1)
const pageSize = ref(25)

const newAlert = ref<
  Omit<Alert, 'id' | 'createdAt'>
>({
  message: '',
  service: '',
  projectId: '',
  severity: 'Error',
  env: 'Production',
  status: 'Open'
})

// ─────────────────────────────────────────────
// SIGNALR EVENT HANDLERS
// ─────────────────────────────────────────────
const onNewAlert = (alert: any) => {
  const exists = alerts.value.some(
    (a: any) => a.id === alert.id
  )

  if (!exists) {
    alerts.value.unshift(alert)
  }

  success(`🚨 New alert: ${alert.message}`)
}

const onUpdatedAlert = (
  updatedAlert: any
) => {
  const index = alerts.value.findIndex(
    (a: any) =>
      a.id === updatedAlert.id
  )

  if (index !== -1) {
    alerts.value[index] = updatedAlert
  }

  success('✏️ Alert updated')
}

const onDeletedAlert = (
  id: string
) => {
  alerts.value = alerts.value.filter(
    (a: any) => a.id !== id
  )

  success('🗑️ Alert deleted')
}

const onBulkDeleted = (
  ids: string[]
) => {
  alerts.value = alerts.value.filter(
    (a: any) => !ids.includes(a.id)
  )

  success('🗑️ Bulk delete completed')
}

const onBulkUpdated = (
  payload: any
) => {
  const { ids, status } = payload

  alerts.value = alerts.value.map(
    (a: any) => {
      if (ids.includes(a.id)) {
        return {
          ...a,
          status
        }
      }

      return a
    }
  )

  success('⚡ Bulk status updated')
}

// ─────────────────────────────────────────────
// Mounted
// ─────────────────────────────────────────────
onMounted(async () => {
  await Promise.all([
    loadAlerts(),
    availableProjects.loadProjects()
  ])

  try {
    // ✅ START SIGNALR
    await $signalr.start()

    console.log(
      '✅ SignalR Connected'
    )

    // ✅ REGISTER EVENTS
    $signalr.on(
      'alert:new',
      onNewAlert
    )

    $signalr.on(
      'alert:updated',
      onUpdatedAlert
    )

    $signalr.on(
      'alert:deleted',
      onDeletedAlert
    )

    $signalr.on(
      'alerts:bulkDeleted',
      onBulkDeleted
    )

    $signalr.on(
      'alerts:bulkUpdated',
      onBulkUpdated
    )
  }
  catch (err) {
    console.error(
      '❌ SignalR Error:',
      err
    )

    showError(
      'Realtime connection failed'
    )
  }
})

// ─────────────────────────────────────────────
// Before Unmount
// ─────────────────────────────────────────────
onBeforeUnmount(async () => {
  // REMOVE EVENTS
  $signalr.off(
    'alert:new',
    onNewAlert
  )

  $signalr.off(
    'alert:updated',
    onUpdatedAlert
  )

  $signalr.off(
    'alert:deleted',
    onDeletedAlert
  )

  $signalr.off(
    'alerts:bulkDeleted',
    onBulkDeleted
  )

  $signalr.off(
    'alerts:bulkUpdated',
    onBulkUpdated
  )

  // STOP CONNECTION
  await $signalr.stop()
})

const refetchAlerts = async () => {
  await loadAlerts()
}

// ─────────────────────────────────────────────
// Tabs
// ─────────────────────────────────────────────
const tabs = computed(() => [
  {
    key: 'all',
    label: t('tabAll'),
    count: alerts.value.length
  },

  {
    key: 'open',
    label: t('tabOpen'),
    count: alerts.value.filter(
      (a: any) =>
        a.status === 'Open'
    ).length
  },

  {
    key: 'acknowledged',
    label: t('tabAck'),
    count: alerts.value.filter(
      (a: any) =>
        a.status === 'Acknowledged'
    ).length
  },

  {
    key: 'escalated',
    label: t('tabEscalated'),
    count: alerts.value.filter(
      (a: any) =>
        a.status === 'Escalated'
    ).length
  },

  {
    key: 'resolved',
    label: t('tabResolved'),
    count: alerts.value.filter(
      (a: any) =>
        a.status === 'Resolved'
    ).length
  }
])

const severityOrder: any = {
  Critical: 0,
  Error: 1,
  Warning: 2,
  Info: 3
}

// ─────────────────────────────────────────────
// Filtered + Sorted
// ─────────────────────────────────────────────
const filteredAlerts = computed(() => {
  let list = alerts.value

  if (activeFilter.value !== 'all') {
    const map: any = {
      open: 'Open',
      acknowledged: 'Acknowledged',
      escalated: 'Escalated',
      resolved: 'Resolved'
    }

    list = list.filter(
      (a: any) =>
        a.status ===
        map[activeFilter.value]
    )
  }

  if (
    severityFilter.value !== 'all'
  ) {
    list = list.filter(
      (a: any) =>
        a.severity ===
        severityFilter.value
    )
  }

  if (envFilter.value !== 'all') {
    list = list.filter(
      (a: any) =>
        a.env === envFilter.value
    )
  }

  if (search.value) {
    const q =
      search.value.toLowerCase()

    list = list.filter((a: any) => {
      const projectName =
        getProjectName(
          a.projectId
        ).toLowerCase()

      return (
        (a.id || '')
          .toLowerCase()
          .includes(q) ||

        (a.message || '')
          .toLowerCase()
          .includes(q) ||

        (a.service || '')
          .toLowerCase()
          .includes(q) ||

        projectName.includes(q)
      )
    })
  }

  list = [...list].sort(
    (a: any, b: any) => {
      let av: any =
        a[sortField.value]

      let bv: any =
        b[sortField.value]

      if (
        sortField.value ===
        'severity'
      ) {
        av =
          severityOrder[av] ?? 9

        bv =
          severityOrder[bv] ?? 9
      }

      if (
        sortField.value ===
        'projectId'
      ) {
        av = getProjectName(
          a.projectId
        )

        bv = getProjectName(
          b.projectId
        )
      }

      if (
        sortField.value ===
        'createdAt'
      ) {
        av = new Date(av || 0)
        bv = new Date(bv || 0)
      }

      if (av < bv) {
        return sortDir.value ===
          'asc'
          ? -1
          : 1
      }

      if (av > bv) {
        return sortDir.value ===
          'asc'
          ? 1
          : -1
      }

      return 0
    }
  )

  return list
})

const totalPages = computed(() =>
  Math.ceil(
    filteredAlerts.value.length /
    pageSize.value
  )
)

const paginatedAlerts = computed(() => {
  const start =
    (currentPage.value - 1) *
    pageSize.value

  return filteredAlerts.value.slice(
    start,
    start + pageSize.value
  )
})

watch(
  [
    activeFilter,
    search,
    severityFilter,
    envFilter
  ],
  () => {
    currentPage.value = 1
  }
)

// ─────────────────────────────────────────────
// Sort / Select
// ─────────────────────────────────────────────
const toggleSort = (
  field: string
) => {
  if (sortField.value === field) {
    sortDir.value =
      sortDir.value === 'asc'
        ? 'desc'
        : 'asc'
  }
  else {
    sortField.value = field
    sortDir.value = 'asc'
  }
}

const allSelected = computed(
  () =>
    paginatedAlerts.value.length >
      0 &&
    paginatedAlerts.value.every(
      (a: any) =>
        a.id
          ? selectedIds.value.has(a.id)
          : false
    )
)

const selectedAlertObjects =
  computed(() =>
    filteredAlerts.value.filter(
      (a: any) =>
        a.id
          ? selectedIds.value.has(
              a.id
            )
          : false
    )
  )

const toggleSelect = (
  id?: string
) => {
  if (!id) return

  const s = new Set(
    selectedIds.value
  )

  if (s.has(id)) {
    s.delete(id)
  }
  else {
    s.add(id)
  }

  selectedIds.value = s
}

const toggleSelectAll = () => {
  const s = new Set(
    selectedIds.value
  )

  if (allSelected.value) {
    paginatedAlerts.value.forEach(
      (a: any) => {
        if (a.id) {
          s.delete(a.id)
        }
      }
    )
  }
  else {
    paginatedAlerts.value.forEach(
      (a: any) => {
        if (a.id) {
          s.add(a.id)
        }
      }
    )
  }

  selectedIds.value = s
}

// ─────────────────────────────────────────────
// Actions
// ─────────────────────────────────────────────
const changeStatus = async (
  alert: any,
  newStatus: AlertStatus
) => {
  if (!alert.id) {
    return false
  }

  const ok = await updateAlert(
    alert.id,
    {
      ...alert,
      status: newStatus
    }
  )

  if (ok) {
    success(
      `Alert marked as ${newStatus}`
    )
  }

  return ok
}

const onStatusChange = (
  alert: any,
  event: Event
) => {
  const target =
    event.target as
    HTMLSelectElement | null

  if (!target) return

  changeStatus(
    alert,
    target.value as AlertStatus
  )
}

const isSelected = (
  id?: string
) => !!id && selectedIds.value.has(id)

const handleBulkDelete = async () => {
  for (const id of selectedIds.value) {
    await deleteAlert(id)
  }

  selectedIds.value = new Set()
}

const handleBulkResolve = async () => {
  for (const a of selectedAlertObjects.value) {
    if (!a.id) continue

    await updateAlert(a.id, {
      ...a,
      status: 'Resolved'
    })
  }

  selectedIds.value = new Set()
}

const handleBulkAcknowledge = async () => {
  for (const a of selectedAlertObjects.value) {
    if (!a.id) continue

    await updateAlert(a.id, {
      ...a,
      status: 'Acknowledged'
    })
  }

  selectedIds.value = new Set()

  success('Alerts acknowledged')
}

const handleBulkEscalate = async () => {
  for (const a of selectedAlertObjects.value) {
    if (!a.id) continue

    await updateAlert(a.id, {
      ...a,
      status: 'Escalated'
    })
  }

  selectedIds.value = new Set()

  success('Alerts escalated')
}

const deleteSingle = async (
  id?: string
) => {
  if (!id) return

  if (
    confirm(
      'Delete this alert?'
    )
  ) {
    await deleteAlert(id)
  }
}

const submitCreate = async () => {
  const ok = await createAlert({
    ...newAlert.value,
    status: 'Open'
  })

  if (ok) {
    showCreateModal.value = false

    newAlert.value = {
      message: '',
      service: '',
      projectId: '',
      severity: 'Error',
      env: 'Production',
      status: 'Open'
    }

    success('Alert created')
  }
}

const openDetail = (alert: any) => {
  if (!alert.id) return

  detailAlertId.value = alert.id
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const formatTime = (
  dt?: string
) => {
  if (!dt) return '—'

  const diff =
    (
      Date.now() -
      new Date(dt).getTime()
    ) / 1000

  if (diff < 60) {
    return `${Math.round(diff)}s ago`
  }

  if (diff < 3600) {
    return `${Math.round(diff / 60)}m ago`
  }

  if (diff < 86400) {
    return `${Math.round(diff / 3600)}h ago`
  }

  return new Date(
    dt
  ).toLocaleDateString()
}

const formatTimeFull = (
  dt?: string
) =>
  dt
    ? new Date(dt).toLocaleString()
    : '—'

const severityRowClass = (
  s: string
) =>
({
  Critical: 'sev-critical',
  Error: 'sev-error',
  Warning: 'sev-warning',
  Info: 'sev-info'
}[s] || '')

const severityBadgeClass = (
  s: string
) =>
({
  Critical: 'badge-critical',
  Error: 'badge-error',
  Warning: 'badge-warning',
  Info: 'badge-info'
}[s] || '')

const statusClass = (
  s: string
) =>
({
  Open: 'status-open',
  Acknowledged: 'status-ack',
  Escalated: 'status-esc',
  Resolved: 'status-res'
}[s] || '')

const statusSelectClass = (
  s: string
) =>
({
  Open: 'ss-open',
  Acknowledged: 'ss-ack',
  Escalated: 'ss-esc',
  Resolved: 'ss-res'
}[s] || '')

const envClass = (
  e: string
) =>
  e === 'Staging'
    ? 'env-staging'
    : 'env-production'

const getTimeline = (alert: any) => {
  const events = [
    {
      label: 'Alert created',
      time: formatTimeFull(
        alert.createdAt
      ),
      color: 'tl-blue'
    }
  ]

  if (
    [
      'Acknowledged',
      'Escalated',
      'Resolved'
    ].includes(alert.status)
  ) {
    events.push({
      label: 'Acknowledged',
      time: '—',
      color: 'tl-yellow'
    })
  }

  if (
    [
      'Escalated',
      'Resolved'
    ].includes(alert.status)
  ) {
    events.push({
      label: 'Escalated',
      time: '—',
      color: 'tl-red'
    })
  }

  if (alert.status === 'Resolved') {
    events.push({
      label: 'Resolved',
      time: '—',
      color: 'tl-green'
    })
  }

  return events
}
</script>

<style scoped>
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; }
.page-title  { font-size: 22px; font-weight: 700; color: #e6edf3; }
.page-sub    { font-size: 13px; color: #586069; margin-top: 3px; }
.connection-status { margin-left: 8px; font-size: 11px; font-weight: 600; padding: 2px 6px; border-radius: 3px; }
.connection-status.online  { color: #3fb950; background: rgba(63,185,80,.15); }
.connection-status.offline { color: #f85149; background: rgba(248,81,73,.15); }

.header-actions { display: flex; align-items: center; gap: 10px; }
.retry-btn, .add-alert-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 14px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all .15s;
}
.retry-btn    { background: #21262d; border: 1px solid #30363d; color: #c9d1d9; }
.retry-btn:hover { border-color: #8b949e; }
.add-alert-btn { background: #238636; border: 1px solid #238636; color: #fff; }
.add-alert-btn:hover { background: #2ea043; }
.sort-icon {
  width: 14px;
  height: 14px;
  margin-left: 4px;
  vertical-align: middle;
  opacity: 0.7;
}
.search-box {
  padding: 7px 14px; border-radius: 6px; border: 1px solid #30363d;
  background: #161b22; color: #c9d1d9; font-size: 13px; width: 220px; outline: none;
}
.search-box:focus { border-color: #58a6ff; }

.bulk-ack-row { display: flex; gap: 8px; margin-bottom: 10px; }
.ack-btn, .esc-btn {
  display: flex; align-items: center; gap: 6px; padding: 6px 14px;
  border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1px solid;
}
.ack-btn { background: rgba(227,179,65,.1); border-color: #e3b341; color: #e3b341; }
.esc-btn { background: rgba(248,81,73,.1); border-color: #f85149; color: #f85149; }

.filter-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; flex-wrap: wrap; gap: 10px; }
.filter-tabs { display: flex; gap: 6px; }
.tab-btn {
  padding: 6px 14px; border-radius: 6px; font-size: 13px; cursor: pointer;
  border: 1px solid #30363d; background: transparent; color: #8b949e; transition: all .15s;
}
.tab-btn:hover { border-color: #58a6ff; color: #58a6ff; }
.tab-btn.active { background: #1f6feb; border-color: #1f6feb; color: #fff; }
.tab-count { background: rgba(255,255,255,.1); padding: 1px 6px; border-radius: 3px; font-size: 11px; margin-left: 4px; }

.filter-right { display: flex; gap: 8px; }
.filter-select {
  padding: 6px 10px; border-radius: 6px; border: 1px solid #30363d;
  background: #161b22; color: #8b949e; font-size: 12px; cursor: pointer; outline: none;
}

.alerts-table { width: 100%; border-collapse: collapse; }
.alerts-table th {
  text-align: left; font-size: 11px; font-weight: 600; color: #586069;
  text-transform: uppercase; letter-spacing: .05em; padding: 8px 10px;
  border-bottom: 1px solid #21262d; white-space: nowrap;
}
.sortable { cursor: pointer; user-select: none; }
.sortable:hover { color: #c9d1d9; }
.alerts-table td { padding: 12px 10px; border-bottom: 1px solid #0d1117; font-size: 13px; }
.col-check { width: 36px; }
.alert-row { cursor: pointer; transition: background .1s; }
.alert-row:hover td { background: #161b22; }
.alert-row.row-selected td { background: rgba(88,166,255,.06); }
.alert-row td:nth-child(2) { border-left: 3px solid transparent; }
.sev-critical td:nth-child(2) { border-left-color: #f85149; }
.sev-error    td:nth-child(2) { border-left-color: #e3b341; }
.sev-warning  td:nth-child(2) { border-left-color: #d29922; }
.sev-info     td:nth-child(2) { border-left-color: #58a6ff; }

.alert-id { color: #58a6ff; font-weight: 600; font-family: 'Courier New', monospace; }

.badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: 5px; font-size: 12px; font-weight: 500; }
.badge-dot { width: 7px; height: 7px; border-radius: 50%; }
.badge-critical { background: rgba(248,81,73,.12);  color: #f85149; } .badge-critical .badge-dot { background: #f85149; }
.badge-error    { background: rgba(227,179,65,.12); color: #e3b341; } .badge-error    .badge-dot { background: #e3b341; }
.badge-warning  { background: rgba(210,153,34,.12); color: #d29922; } .badge-warning  .badge-dot { background: #d29922; }
.badge-info     { background: rgba(88,166,255,.12); color: #58a6ff; } .badge-info     .badge-dot { background: #58a6ff; }

/* PROJECT BADGE */
.project-badge {
  display: inline-flex; align-items: center; gap: 5px; justify-content: center;
  padding: 3px 10px; border-radius: 999px;
  background: rgba(88,166,255,.12); border: 1px solid rgba(88,166,255,.25);
  color: #58a6ff; font-size: 12px; font-weight: 600; min-width: 70px;
  transition: all .15s;
}
/* Badge có link thì hiện con trỏ tay + hover effect */
.project-badge-link { cursor: pointer; }
.project-badge-link:hover {
  background: rgba(88,166,255,.25);
  border-color: #58a6ff;
  text-decoration: underline;
}
.badge-folder-icon { width: 11px; height: 11px; flex-shrink: 0; }

.status-select {
  padding: 3px 8px; border-radius: 5px; border: 1px solid #30363d;
  background: #0d1117; font-size: 12px; font-weight: 500; cursor: pointer; outline: none;
}
.ss-open { color: #3fb950; border-color: #3fb950; }
.ss-ack  { color: #e3b341; border-color: #e3b341; }
.ss-esc  { color: #f85149; border-color: #f85149; }
.ss-res  { color: #58a6ff; border-color: #58a6ff; }

.status-open { color: #3fb950; font-weight: 500; }
.status-ack  { color: #e3b341; font-weight: 500; }
.status-esc  { color: #f85149; font-weight: 500; }
.status-res  { color: #58a6ff; font-weight: 500; }

.env-badge { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
.env-production { background: rgba(248,81,73,.15); color: #f85149; }
.env-staging    { background: rgba(210,153,34,.15); color: #d29922; }

.msg-text     { color: #c9d1d9; max-width: 420px; }
.service-text { font-family: 'Courier New', monospace; font-size: 12px; color: #8b949e; }
.time-text    { color: #586069; font-size: 12px; white-space: nowrap; }

.actions-col { white-space: nowrap; }
.row-action-btn {
  background: none; border: none; color: #586069; cursor: pointer; padding: 4px 6px;
  border-radius: 4px; transition: all .15s;
}
.row-action-btn:hover { color: #58a6ff; background: rgba(88,166,255,.1); }
.row-action-btn.danger:hover { color: #f85149; background: rgba(248,81,73,.1); }

.empty-state { text-align: center; color: #586069; padding: 40px; }

.pagination { display: flex; align-items: center; gap: 10px; margin-top: 16px; justify-content: flex-end; }
.page-btn {
  padding: 5px 12px; border-radius: 5px; background: #161b22; border: 1px solid #30363d;
  color: #c9d1d9; cursor: pointer; font-size: 14px;
}
.page-btn:disabled { opacity: .4; cursor: default; }
.page-info { font-size: 12px; color: #586069; }
.page-size-select {
  padding: 4px 8px; border-radius: 5px; background: #161b22; border: 1px solid #30363d;
  color: #8b949e; font-size: 12px; cursor: pointer;
}

.loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; color: #8b949e; }
.loading-icon { width: 32px; height: 32px; margin-bottom: 16px; animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.detail-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 1000; display: flex; justify-content: flex-end; }
.detail-panel {
  width: 420px; height: 100vh; background: #161b22; border-left: 1px solid #30363d;
  overflow-y: auto; display: flex; flex-direction: column; animation: slideIn .2s ease-out;
}
@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
.detail-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 20px; border-bottom: 1px solid #21262d; position: sticky; top: 0; background: #161b22; z-index: 1;
}
.detail-id { font-size: 16px; font-weight: 700; color: #58a6ff; font-family: 'Courier New', monospace; }
.detail-service { font-size: 12px; color: #586069; margin-top: 2px; }
.close-btn { background: none; border: none; color: #586069; cursor: pointer; font-size: 18px; padding: 2px 6px; border-radius: 4px; }
.close-btn:hover { color: #e6edf3; background: #21262d; }
.detail-body { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
.detail-section { display: flex; flex-direction: column; gap: 6px; }
.detail-label { font-size: 11px; font-weight: 600; color: #586069; text-transform: uppercase; letter-spacing: .06em; }
.detail-message { background: #0d1117; border: 1px solid #21262d; border-radius: 6px; padding: 12px; color: #c9d1d9; font-size: 13px; line-height: 1.5; }
.detail-value { font-size: 13px; color: #c9d1d9; }

.timeline { display: flex; flex-direction: column; }
.timeline-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; position: relative; }
.timeline-item:not(:last-child)::before {
  content: ''; position: absolute; left: 7px; top: 24px; width: 2px; height: calc(100% - 8px); background: #21262d;
}
.tl-dot { width: 16px; height: 16px; border-radius: 50%; flex-shrink: 0; border: 2px solid #161b22; }
.tl-blue { background: #58a6ff; } .tl-yellow { background: #e3b341; }
.tl-red  { background: #f85149; } .tl-green  { background: #3fb950; }
.tl-info { display: flex; flex-direction: column; gap: 2px; }
.tl-label { font-size: 13px; color: #c9d1d9; font-weight: 500; }
.tl-time  { font-size: 11px; color: #586069; }

.detail-actions { display: flex; gap: 8px; margin-top: 8px; }
.da-btn {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 9px 12px; border-radius: 7px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1px solid; transition: all .15s;
}
.da-btn.ack { border-color: #e3b341; color: #e3b341; background: rgba(227,179,65,.08); }
.da-btn.ack:hover { background: rgba(227,179,65,.2); }
.da-btn.esc { border-color: #f85149; color: #f85149; background: rgba(248,81,73,.08); }
.da-btn.esc:hover { background: rgba(248,81,73,.2); }
.da-btn.res { border-color: #3fb950; color: #3fb950; background: rgba(63,185,80,.08); }
.da-btn.res:hover { background: rgba(63,185,80,.2); }

.create-modal {
  width: 460px; background: #161b22; border-radius: 12px; border: 1px solid #30363d;
  margin: auto; animation: fadeIn .2s ease-out;
}
@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
.create-form { padding: 20px; display: flex; flex-direction: column; gap: 10px; }
.create-form label { font-size: 12px; color: #586069; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; }
.form-input {
  padding: 8px 12px; border-radius: 6px; border: 1px solid #30363d;
  background: #0d1117; color: #c9d1d9; font-size: 13px; outline: none; width: 100%;
}
.form-input:focus { border-color: #58a6ff; }
.create-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }
.cancel-btn {
  padding: 8px 16px; border-radius: 6px; background: transparent; border: 1px solid #30363d;
  color: #8b949e; font-size: 13px; cursor: pointer;
}
.submit-btn {
  padding: 8px 20px; border-radius: 6px; background: #238636; border: 1px solid #238636;
  color: #fff; font-size: 13px; font-weight: 600; cursor: pointer;
}
.submit-btn:disabled { opacity: .5; cursor: default; }
.page-wrap { width: 100%; min-width: 0; }
</style>