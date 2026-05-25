<template>
  <div class="page-wrap" :class="{ compact: preferences.compactView }">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">
          {{ t('alertsTitle') }}
        </h1>

        <p class="page-sub">
          {{ filteredAlerts.length }} / {{ alerts.length }} alerts

          <span
            v-if="!apiConnected"
            class="connection-status offline"
          >
            • Offline
          </span>

          <span
            v-else
            class="connection-status online"
          >
            • Live
          </span>
        </p>
      </div>

      <div class="header-actions">

        <!-- COMPACT TOGGLE -->
        <button
          class="compact-btn"
          @click="savePreferences({
            compactView: !preferences.compactView
          })"
        >
          <Icon name="lucide:panel-top-close" />

          {{ preferences.compactView ? 'Normal' : 'Compact' }}
        </button>

        <button
          v-if="!apiConnected"
          @click="refetchAlerts"
          class="retry-btn"
          :disabled="loading"
        >
          <Icon name="lucide:refresh-ccw" />
          {{ t('retry') }}
        </button>

        <button
          class="add-alert-btn"
          @click="showCreateModal = true"
        >
          <Icon name="lucide:plus" />
          {{ t('newAlert') }}
        </button>

        <input
          class="search-box"
          v-model="search"
          :placeholder="t('searchAlerts')"
        />
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
import { useUserPreferences } from '~/composables/useUserPreferences'
import type {
  Alert,
  AlertStatus
} from '~/types'

import { useI18n } from '~/composables/useI18n'

const { t } = useI18n()
const router = useRouter()
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

const normalizeId = (
  value?: string | null
) => String(value || '').trim()

const getProject = (
  projectId?: string | null
) => {
  const id = normalizeId(projectId)

  if (!id) return null

  return (
    projects.value.find((p: any) => {
      return (
        normalizeId(p.id) === id ||
        normalizeId(p._id) === id
      )
    }) || null
  )
}

const getProjectId = (
  projectId?: string | null
) => {
  const project = getProject(projectId)

  return (
    project?.id ||
    project?._id ||
    null
  )
}

const getProjectName = (
  projectId?: string | null
) => {
  const project = getProject(projectId)

  return project?.name || '—'
}

const goToProject = async (
  projectId?: string | null
) => {
  const id = getProjectId(projectId)

  if (!id) return

  await router.push(
    `/projects/${id}`
  )
}

// ─────────────────────────────────────────────
// State
// ─────────────────────────────────────────────
const { 
  preferences, 
  savePreferences 
} = useUserPreferences()
const search = ref('')

const activeFilter = ref('all')
const severityFilter = ref('all')
const envFilter = ref('all')

const sortField = ref('createdAt')
const sortDir = ref<'asc' | 'desc'>(
  'desc'
)

const selectedIds = ref(
  new Set<string>()
)

const detailAlertId = ref<
  string | null
>(null)

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
// Computed
// ─────────────────────────────────────────────
const detailAlert = computed(() => {
  if (!detailAlertId.value) {
    return null
  }

  return (
    alerts.value.find(
      (a: any) =>
        a.id ===
        detailAlertId.value
    ) || null
  )
})

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
        a.status ===
        'Acknowledged'
    ).length
  },
  {
    key: 'escalated',
    label: t('tabEscalated'),
    count: alerts.value.filter(
      (a: any) =>
        a.status ===
        'Escalated'
    ).length
  },
  {
    key: 'resolved',
    label: t('tabResolved'),
    count: alerts.value.filter(
      (a: any) =>
        a.status ===
        'Resolved'
    ).length
  }
])

const severityOrder: Record<
  string,
  number
> = {
  Critical: 0,
  Error: 1,
  Warning: 2,
  Info: 3
}

const filteredAlerts = computed(() => {
  let list = [...alerts.value]

  // Status filter
  if (activeFilter.value !== 'all') {
    const map: Record<
      string,
      AlertStatus
    > = {
      open: 'Open',
      acknowledged:
        'Acknowledged',
      escalated: 'Escalated',
      resolved: 'Resolved'
    }

    list = list.filter(
      (a: any) =>
        a.status ===
        map[activeFilter.value]
    )
  }

  // Severity filter
  if (
    severityFilter.value !== 'all'
  ) {
    list = list.filter(
      (a: any) =>
        a.severity ===
        severityFilter.value
    )
  }

  // Environment filter
  if (envFilter.value !== 'all') {
    list = list.filter(
      (a: any) =>
        a.env === envFilter.value
    )
  }

  // Search
  if (search.value.trim()) {
    const q = search.value
      .toLowerCase()
      .trim()

    list = list.filter(
      (a: any) => {
        return [
          a.id,
          a.message,
          a.service,
          getProjectName(
            a.projectId
          )
        ]
          .filter(Boolean)
          .some((v: any) =>
            String(v)
              .toLowerCase()
              .includes(q)
          )
      }
    )
  }

  // Sort
  list.sort((a: any, b: any) => {
    let av: any =
      a[sortField.value]
    let bv: any =
      b[sortField.value]

    switch (sortField.value) {
      case 'severity':
        av =
          severityOrder[av] ?? 99
        bv =
          severityOrder[bv] ?? 99
        break

      case 'projectId':
        av = getProjectName(
          a.projectId
        )
        bv = getProjectName(
          b.projectId
        )
        break

      case 'createdAt':
        av = new Date(
          av || 0
        ).getTime()

        bv = new Date(
          bv || 0
        ).getTime()

        break
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
  })

  return list
})

const totalPages = computed(() =>
  Math.max(
    1,
    Math.ceil(
      filteredAlerts.value.length /
      pageSize.value
    )
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

const allSelected = computed(() => {
  if (
    paginatedAlerts.value.length === 0
  ) {
    return false
  }

  return paginatedAlerts.value.every(
    (a: any) =>
      a.id &&
      selectedIds.value.has(a.id)
  )
})

const selectedAlertObjects =
  computed(() => {
    return filteredAlerts.value.filter(
      (a: any) =>
        a.id &&
        selectedIds.value.has(a.id)
    )
  })

// ─────────────────────────────────────────────
// Lifecycle
// ─────────────────────────────────────────────
onMounted(async () => {
  await Promise.all([
    loadAlerts(),
    availableProjects.loadProjects()
  ])

  try {
    await $signalr.start()

    registerSignalREvents()

    console.log(
      '✅ SignalR connected'
    )
  }
  catch (err) {
    console.error(err)

    showError(
      'Realtime connection failed'
    )
  }
})

onBeforeUnmount(async () => {
  unregisterSignalREvents()

  try {
    await $signalr.stop()
  }
  catch (err) {
    console.error(err)
  }
})

// ─────────────────────────────────────────────
// Watchers
// ─────────────────────────────────────────────
watch(
  [
    activeFilter,
    severityFilter,
    envFilter,
    search,
    pageSize
  ],
  () => {
    currentPage.value = 1
  }
)

watch(currentPage, value => {
  if (value < 1) {
    currentPage.value = 1
  }

  if (value > totalPages.value) {
    currentPage.value =
      totalPages.value
  }
})

// ─────────────────────────────────────────────
// SignalR
// ─────────────────────────────────────────────
const onNewAlert = (
  alert: Alert
) => {
  const exists =
    alerts.value.some(
      (a: any) =>
        a.id === alert.id
    )

  if (exists) return

  alerts.value.unshift(alert)

  success(
    `🚨 ${alert.message}`
  )
}

const onUpdatedAlert = (
  updatedAlert: Alert
) => {
  const index =
    alerts.value.findIndex(
      (a: any) =>
        a.id === updatedAlert.id
    )

  if (index === -1) return

  alerts.value[index] =
    updatedAlert
}

const onDeletedAlert = (
  id: string
) => {
  alerts.value =
    alerts.value.filter(
      (a: any) => a.id !== id
    )
}

const onBulkDeleted = (
  ids: string[]
) => {
  alerts.value =
    alerts.value.filter(
      (a: any) =>
        !ids.includes(a.id)
    )
}

const onBulkUpdated = (
  payload: {
    ids: string[]
    status: AlertStatus
  }
) => {
  alerts.value =
    alerts.value.map(
      (a: any) => {
        if (
          payload.ids.includes(a.id)
        ) {
          return {
            ...a,
            status:
              payload.status
          }
        }

        return a
      }
    )
}

const registerSignalREvents =
  () => {
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

const unregisterSignalREvents =
  () => {
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
  }

// ─────────────────────────────────────────────
// Actions
// ─────────────────────────────────────────────
const refetchAlerts = async () => {
  await loadAlerts()
}

const toggleSort = (
  field: string
) => {
  if (sortField.value === field) {
    sortDir.value =
      sortDir.value === 'asc'
        ? 'desc'
        : 'asc'

    return
  }

  sortField.value = field
  sortDir.value = 'asc'
}

const toggleSelect = (
  id?: string
) => {
  if (!id) return

  const next = new Set(
    selectedIds.value
  )

  if (next.has(id)) {
    next.delete(id)
  }
  else {
    next.add(id)
  }

  selectedIds.value = next
}

const toggleSelectAll = () => {
  const next = new Set(
    selectedIds.value
  )

  if (allSelected.value) {
    paginatedAlerts.value.forEach(
      (a: any) => {
        if (a.id) {
          next.delete(a.id)
        }
      }
    )
  }
  else {
    paginatedAlerts.value.forEach(
      (a: any) => {
        if (a.id) {
          next.add(a.id)
        }
      }
    )
  }

  selectedIds.value = next
}

const isSelected = (
  id?: string
) => {
  return !!(
    id &&
    selectedIds.value.has(id)
  )
}

const changeStatus = async (
  alert: Alert,
  status: AlertStatus
) => {
  if (!alert.id) return

  const ok = await updateAlert(
    alert.id,
    {
      ...alert,
      status
    }
  )

  if (ok) {
    success(
      `Alert ${status}`
    )
  }
}

const onStatusChange = (
  alert: Alert,
  event: Event
) => {
  const target =
    event.target as HTMLSelectElement

  changeStatus(
    alert,
    target.value as AlertStatus
  )
}

const handleBulkDelete =
  async () => {
    const ids = [
      ...selectedIds.value
    ]

    await Promise.all(
      ids.map(id =>
        deleteAlert(id)
      )
    )

    selectedIds.value =
      new Set()

    success('Deleted')
  }

const handleBulkResolve =
  async () => {
    await Promise.all(
      selectedAlertObjects.value.map(
        async (a: any) => {
          if (!a.id) return

          await updateAlert(
            a.id,
            {
              ...a,
              status: 'Resolved'
            }
          )
        }
      )
    )

    selectedIds.value =
      new Set()

    success('Resolved')
  }

const handleBulkAcknowledge =
  async () => {
    await Promise.all(
      selectedAlertObjects.value.map(
        async (a: any) => {
          if (!a.id) return

          await updateAlert(
            a.id,
            {
              ...a,
              status:
                'Acknowledged'
            }
          )
        }
      )
    )

    selectedIds.value =
      new Set()

    success('Acknowledged')
  }

const handleBulkEscalate =
  async () => {
    await Promise.all(
      selectedAlertObjects.value.map(
        async (a: any) => {
          if (!a.id) return

          await updateAlert(
            a.id,
            {
              ...a,
              status: 'Escalated'
            }
          )
        }
      )
    )

    selectedIds.value =
      new Set()

    success('Escalated')
  }

const deleteSingle = async (
  id?: string
) => {
  if (!id) return

  const confirmed =
    confirm(
      'Delete this alert?'
    )

  if (!confirmed) return

  await deleteAlert(id)

  success('Deleted')
}

const submitCreate = async () => {
  const payload = {
    ...newAlert.value,
    status: 'Open' as AlertStatus
  }

  const ok = await createAlert(payload)

  if (!ok) return

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

const openDetail = (
  alert: Alert
) => {
  if (!alert.id) return

  detailAlertId.value =
    alert.id
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const formatTime = (
  dt?: string
) => {
  if (!dt) return '—'

  const now = Date.now()

  const diff =
    (now -
      new Date(dt).getTime()) /
    1000

  if (diff < 60) {
    return `${Math.floor(diff)}s ago`
  }

  if (diff < 3600) {
    return `${Math.floor(
      diff / 60
    )}m ago`
  }

  if (diff < 86400) {
    return `${Math.floor(
      diff / 3600
    )}h ago`
  }

  return new Date(
    dt
  ).toLocaleDateString()
}

const formatTimeFull = (
  dt?: string
) => {
  if (!dt) return '—'

  return new Date(
    dt
  ).toLocaleString()
}

const severityRowClass = (
  severity: string
) => {
  return (
    {
      Critical:
        'sev-critical',
      Error: 'sev-error',
      Warning:
        'sev-warning',
      Info: 'sev-info'
    }[severity] || ''
  )
}

const severityBadgeClass = (
  severity: string
) => {
  return (
    {
      Critical:
        'badge-critical',
      Error: 'badge-error',
      Warning:
        'badge-warning',
      Info: 'badge-info'
    }[severity] || ''
  )
}

const statusClass = (
  status: string
) => {
  return (
    {
      Open: 'status-open',
      Acknowledged:
        'status-ack',
      Escalated:
        'status-esc',
      Resolved:
        'status-res'
    }[status] || ''
  )
}

const statusSelectClass = (
  status: string
) => {
  return (
    {
      Open: 'ss-open',
      Acknowledged:
        'ss-ack',
      Escalated:
        'ss-esc',
      Resolved:
        'ss-res'
    }[status] || ''
  )
}

const envClass = (
  env: string
) => {
  return env === 'Staging'
    ? 'env-staging'
    : 'env-production'
}

const getTimeline = (
  alert: Alert
) => {
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

  if (
    alert.status ===
    'Resolved'
  ) {
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
/* =========================================================
   PAGE
========================================================= */

.page-wrap {
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* =========================================================
   HEADER
========================================================= */

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.page-sub {
  margin-top: 4px;
  font-size: 13px;
  color: var(--text-tertiary);
}

.connection-status {
  margin-left: 8px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.connection-status.online {
  background: var(--success-subtle);
  color: var(--success-color);
}

.connection-status.offline {
  background: var(--danger-subtle);
  color: var(--danger-color);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

/* =========================================================
   BUTTONS
========================================================= */

.retry-btn,
.add-alert-btn,
.compact-btn {
  height: 36px;

  display: flex;
  align-items: center;
  gap: 6px;

  padding: 0 14px;

  border-radius: 8px;
  border: 1px solid var(--input-border);

  font-size: 12px;
  font-weight: 600;

  cursor: pointer;
  transition: .15s ease;
}

.retry-btn,
.compact-btn {
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.retry-btn:hover,
.compact-btn:hover {
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.add-alert-btn {
  background: #238636;
  border-color: #238636;
  color: #fff;
}

.add-alert-btn:hover {
  background: #2ea043;
}

/* =========================================================
   SEARCH
========================================================= */

.search-box {
  width: 230px;
  height: 36px;

  padding: 0 14px;

  border-radius: 8px;
  border: 1px solid var(--input-border);

  background: var(--input-bg);
  color: var(--input-text);

  font-size: 13px;
  outline: none;
}

.search-box:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px var(--accent-subtle);
}

/* =========================================================
   FILTER BAR
========================================================= */

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tab-btn {
  height: 34px;

  display: flex;
  align-items: center;

  padding: 0 14px;

  border-radius: 8px;
  border: 1px solid var(--border-color);

  background: transparent;
  color: var(--text-tertiary);

  font-size: 13px;
  cursor: pointer;

  transition: .15s ease;
}

.tab-btn:hover {
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.tab-btn.active {
  background: var(--accent-color);
  border-color: var(--accent-color);
  color: white;
}

.tab-count {
  margin-left: 6px;

  padding: 1px 6px;

  border-radius: 999px;

  background: rgba(255,255,255,.15);

  font-size: 11px;
}

.filter-right {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-select {
  height: 34px;

  padding: 0 12px;

  border-radius: 8px;
  border: 1px solid var(--input-border);

  background: var(--input-bg);
  color: var(--input-text);

  font-size: 12px;
  outline: none;
}

/* =========================================================
   TABLE
========================================================= */

.alerts-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.alerts-table th {
  padding: 10px;
  text-align: left;

  background: var(--table-header-bg);

  border-bottom: 1px solid var(--border-color);

  font-size: 11px;
  font-weight: 700;

  color: var(--text-muted);

  white-space: nowrap;
}

.alerts-table td {
  padding: 12px 10px;

  border-bottom: 1px solid var(--border-color);

  background: var(--table-row-bg);

  font-size: 13px;

  overflow: hidden;
  text-overflow: ellipsis;
}

.alert-row {
  cursor: pointer;
  transition: .12s ease;
}

.alert-row:hover td {
  background: var(--table-row-hover);
}

.alert-row.row-selected td {
  background: var(--accent-subtle);
}

/* =========================================================
   COLUMN WIDTH
========================================================= */

.col-check {
  width: 40px;
}

.alerts-table th:nth-child(2) {
  width: 90px;
}

.alerts-table th:nth-child(3) {
  width: 140px;
}

.alerts-table th:nth-child(4) {
  width: 110px;
}

.alerts-table th:nth-child(5) {
  width: 130px;
}

.alerts-table th:nth-child(7) {
  width: 120px;
}

.alerts-table th:nth-child(8) {
  width: 90px;
}

.alerts-table th:nth-child(9) {
  width: 120px;
}

.alerts-table th:nth-child(10) {
  width: 90px;
}

/* =========================================================
   ALERT COLORS
========================================================= */

.alert-row td:nth-child(2) {
  border-left: 3px solid transparent;
}

.sev-critical td:nth-child(2) {
  border-left-color: #ff6b6b;
}

.sev-error td:nth-child(2) {
  border-left-color: #e3b341;
}

.sev-warning td:nth-child(2) {
  border-left-color: #d29922;
}

.sev-info td:nth-child(2) {
  border-left-color: #58a6ff;
}

/* =========================================================
   BADGES
========================================================= */

.badge,
.project-badge,
.env-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;

  padding: 4px 10px;

  border-radius: 999px;

  font-size: 11px;
  font-weight: 700;

  white-space: nowrap;
}

.project-badge {
  background: var(--accent-subtle);
  color: var(--accent-color);
  border: 1px solid rgba(88,166,255,.25);
}

.project-badge-link {
  cursor: pointer;
}

.project-badge-link:hover {
  filter: brightness(1.15);
}

/* =========================================================
   MESSAGE / TEXT
========================================================= */

.msg-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.service-text {
  font-family: monospace;
  font-size: 12px;
}

.time-text {
  font-size: 12px;
  color: var(--text-muted);
}

/* =========================================================
   ACTIONS
========================================================= */

.actions-col {
  white-space: nowrap;
}

.row-action-btn {
  width: 30px;
  height: 30px;

  border: none;
  border-radius: 6px;

  background: transparent;
  color: var(--text-muted);

  cursor: pointer;
  transition: .15s ease;
}

.row-action-btn:hover {
  background: var(--accent-subtle);
  color: var(--accent-color);
}

.row-action-btn.danger:hover {
  background: var(--danger-subtle);
  color: var(--danger-color);
}

/* =========================================================
   PAGINATION
========================================================= */

.pagination {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
}

.page-btn {
  width: 32px;
  height: 32px;

  border-radius: 6px;
  border: 1px solid var(--input-border);

  background: var(--bg-secondary);

  cursor: pointer;
}

.page-info {
  font-size: 12px;
  color: var(--text-tertiary);
}

/* =========================================================
   DETAIL PANEL
========================================================= */

.detail-overlay {
  position: fixed;
  inset: 0;

  background: rgba(0,0,0,.5);

  z-index: 999;

  display: flex;
  justify-content: flex-end;
}

.detail-panel {
  width: 440px;
  max-width: 100%;

  height: 100vh;

  background: var(--card-bg);

  overflow-y: auto;

  border-left: 1px solid var(--border-color);
}

/* =========================================================
   MODAL
========================================================= */

.create-modal {
  width: 460px;
  max-width: calc(100vw - 24px);

  margin: auto;

  border-radius: 14px;

  background: var(--card-bg);
  border: 1px solid var(--card-border);
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 10px;

  padding: 20px;
}

.form-input {
  width: 100%;
  height: 40px;

  padding: 0 12px;

  border-radius: 8px;
  border: 1px solid var(--input-border);

  background: var(--input-bg);
  color: var(--input-text);

  outline: none;
}

.form-input:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px var(--accent-subtle);
}

/* =========================================================
   COMPACT MODE
========================================================= */

.compact .alerts-table th {
  padding: 6px 8px;
  font-size: 10px;
}

.compact .alerts-table td {
  padding: 7px 8px;
  font-size: 12px;
}

.compact .badge,
.compact .project-badge,
.compact .env-badge {
  padding: 2px 7px;
  font-size: 10px;
}

.compact .search-box {
  width: 170px;
  height: 32px;
}

.compact .retry-btn,
.compact .add-alert-btn,
.compact .compact-btn {
  height: 32px;
  padding: 0 10px;
}

.compact .msg-text {
  max-width: 220px;
}

.compact .service-text {
  max-width: 100px;

  display: inline-block;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* =========================================================
   LOADING
========================================================= */

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  padding: 60px 20px;

  color: var(--text-tertiary);
}

.loading-icon {
  width: 30px;
  height: 30px;

  margin-bottom: 14px;

  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}

/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 1100px) {

  .alerts-table {
    min-width: 1100px;
  }

  .page-wrap {
    overflow-x: auto;
  }
}

@media (max-width: 768px) {

  .page-header {
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
  }

  .search-box {
    width: 100%;
  }

  .detail-panel {
    width: 100%;
  }

  .create-modal {
    width: calc(100vw - 20px);
  }
}
</style>