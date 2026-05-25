<template>
  <div class="page-wrap">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">
          {{ t('projectsTitle') }}
        </h1>

        <p class="page-sub">
          {{ projects.length }}
          {{ t('projectsSub') }}
        </p>
      </div>

      <button
        class="add-btn"
        @click="showAddModal = true"
      >
        <Icon name="lucide:plus" />
        {{ t('addProject') }}
      </button>
    </div>

    <!-- Loading -->
    <div
      v-if="projectsLoading"
      class="loading-state"
    >
      <Icon
        name="lucide:loader-2"
        class="loading-icon"
      />

      <p>
        {{ t('loadingProjects') }}
      </p>
    </div>

    <!-- Empty -->
    <div
      v-else-if="projects.length === 0"
      class="empty-state"
    >
      <Icon name="lucide:folder-open" />

      <p>No projects found</p>
    </div>

    <!-- Projects -->
    <div
      v-else
      class="projects-grid"
    >
      <div
        v-for="p in projects"
        :key="p.id || p.name"
        class="project-card"
        :class="cardClass(p.sev)"
        @click="goToProject(p)"
      >
        <!-- Header -->
        <div class="proj-header">
          <div class="proj-header-left">
            <div class="proj-name">
              {{ p.name }}
            </div>

            <div class="proj-id">
              #{{ p.id || 'N/A' }}
            </div>
          </div>

          <div class="proj-header-right">
            <span
              class="badge"
              :class="badgeClass(p.sev)"
            >
              <span class="badge-dot"></span>
              {{ p.sev }}
            </span>

            <!-- Menu -->
            <div
              class="menu-wrap"
              @click.stop
            >
              <button
                class="menu-btn"
                @click="toggleMenu(p.id || p.name)"
              >
                <Icon name="lucide:more-vertical" />
              </button>

              <div
                v-if="activeMenu === (p.id || p.name)"
                class="dropdown"
              >
                <button
                  class="drop-item"
                  @click="goToProject(p)"
                >
                  <Icon name="lucide:eye" />
                  View Detail
                </button>

                <button
                  class="drop-item"
                  @click="openEdit(p)"
                >
                  <Icon name="lucide:pencil" />
                  Edit
                </button>

                <button
                  class="drop-item drop-danger"
                  @click="confirmDelete(p)"
                >
                  <Icon name="lucide:trash-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Description -->
        <p class="proj-desc">
          {{ p.desc || 'No description available' }}
        </p>

        <!-- Stats -->
        <div class="proj-stats">
          <div class="stat-item">
            <Icon name="lucide:bell" />

            <span>
              {{ p.alertCount || 0 }}
              Alerts
            </span>
          </div>

          <div class="stat-item">
            <Icon name="lucide:users" />

            <span>
              {{ totalMembers(p) }}
              Members
            </span>
          </div>
        </div>

        <!-- Footer -->
        <div class="proj-footer">
          <!-- Members -->
          <div class="avatars">
            <!-- Owner -->
            <div
              v-if="p.owner"
              class="avatar av-owner"
              :title="p.owner.name"
            >
              {{ initials(p.owner.name) }}
            </div>

            <!-- Managers -->
            <div
              v-for="manager in p.managers || []"
              :key="manager.email"
              class="avatar av-manager"
              :title="manager.name"
            >
              {{ initials(manager.name) }}
            </div>

            <!-- Members -->
            <div
              v-for="member in p.members || []"
              :key="member.email"
              class="avatar av-member"
              :title="member.name"
            >
              {{ initials(member.name) }}
            </div>

            <!-- Empty -->
            <div
              v-if="
                !p.owner &&
                (!p.managers || p.managers.length === 0) &&
                (!p.members || p.members.length === 0)
              "
              class="no-members"
            >
              No members
            </div>
          </div>

          <!-- Status -->
          <span class="proj-alert-count">
            {{
              p.alertCount > 0
                ? 'Active'
                : 'Quiet'
            }}
          </span>
        </div>
      </div>
    </div>

    <!-- Add Modal -->
    <AddProjectModal
      v-if="showAddModal"
      @close="showAddModal = false"
      @add="handleAddProject"
    />

    <!-- Delete Modal -->
    <div
      v-if="deleteTarget"
      class="modal-overlay"
      @click.self="deleteTarget = null"
    >
      <div class="confirm-modal">
        <h3>
          Delete Project?
        </h3>

        <p>
          Are you sure you want to
          delete
          <strong>
            {{ deleteTarget.name }}
          </strong>
          ?
        </p>

        <div class="confirm-actions">
          <button
            class="btn-cancel"
            @click="deleteTarget = null"
          >
            Cancel
          </button>

          <button
            class="btn-delete"
            :disabled="deleting"
            @click="handleDelete"
          >
            {{
              deleting
                ? 'Deleting...'
                : 'Delete'
            }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '~/composables/useI18n'

const { t } = useI18n()

const router = useRouter()

const {
  projects,
  projectsLoading,
  loadProjects
} = useProjects()

const { success, error: showError } =
  useToast()

const { apiCall } = useApi()

const showAddModal = ref(false)

const activeMenu = ref<
  string | null
>(null)

const deleteTarget = ref<any>(null)

const deleting = ref(false)

const handleOutsideClick = () => {
  activeMenu.value = null
}

onMounted(async () => {
  await loadProjects()

  document.addEventListener(
    'click',
    handleOutsideClick
  )
})

onUnmounted(() => {
  document.removeEventListener(
    'click',
    handleOutsideClick
  )
})

const goToProject = (p: any) => {
  activeMenu.value = null

  router.push(
    `/projects/${p.id || p.name}`
  )
}

const toggleMenu = (
  id: string
) => {
  activeMenu.value =
    activeMenu.value === id
      ? null
      : id
}

const openEdit = (p: any) => {
  activeMenu.value = null

  router.push(
    `/projects/${p.id || p.name}/edit`
  )
}

const confirmDelete = (
  p: any
) => {
  activeMenu.value = null
  deleteTarget.value = p
}

const handleDelete = async () => {
  if (!deleteTarget.value) return

  deleting.value = true

  try {
    const p = deleteTarget.value

    const result = await apiCall(
      `/api/projects/${p.id || p.name}`,
      {
        method: 'DELETE'
      }
    )

    if (result?.success) {
      success(
        `Project "${p.name}" deleted successfully`
      )

      deleteTarget.value = null

      await loadProjects()
    } else {
      showError(
        'Failed to delete project'
      )
    }
  } catch (err) {
    console.error(err)

    showError(
      'Error deleting project'
    )
  } finally {
    deleting.value = false
  }
}

const handleAddProject = async (
  newProject: any
) => {
  try {
    const existingProject =
      projects.value.find(
        (p: any) =>
          p.name.toLowerCase() ===
          newProject.name.toLowerCase()
      )

    if (existingProject) {
      showError(
        `Project "${newProject.name}" already exists`
      )

      return
    }

    const result = await apiCall(
      '/api/projects',
      {
        method: 'POST',
        body: newProject
      }
    )

    if (result?.success) {
      success(
        'Project added successfully'
      )

      showAddModal.value = false

      await loadProjects()
    } else {
      showError(
        'Failed to add project'
      )
    }
  } catch (err) {
    console.error(err)

    showError(
      'Error adding project'
    )
  }
}

const initials = (
  name?: string
) => {
  if (!name) return '?'

  return name
    .split(' ')
    .map(w => w.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

const totalMembers = (p: any) => {
  return (
    (p.owner ? 1 : 0) +
    (p.managers?.length || 0) +
    (p.members?.length || 0)
  )
}

const cardClass = (
  sev?: string
) => {
  const map: Record<
    string,
    string
  > = {
    Critical: 'card-critical',
    Error: 'card-error',
    Warning: 'card-warning',
    Resolved: 'card-resolved'
  }

  return map[sev || ''] || ''
}

const badgeClass = (
  sev?: string
) => {
  const map: Record<
    string,
    string
  > = {
    Critical: 'badge-critical',
    Error: 'badge-error',
    Warning: 'badge-warning',
    Resolved: 'badge-resolved'
  }

  return (
    map[sev || ''] ||
    'badge-warning'
  )
}
</script>

<style scoped>
.page-wrap {
  width: 100%;
  min-width: 0;
}

/* Header */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 22px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.page-sub {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 4px;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid var(--input-border);
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: .15s;
}

.add-btn:hover {
  border-color: var(--accent-color);
  color: var(--accent-color);
}

/* Grid */
.projects-grid {
  display: grid;
  grid-template-columns:
    repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

/* Card */
.project-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-left: 3px solid transparent;
  border-radius: 12px;
  padding: 18px;
  cursor: pointer;
  transition: .15s;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.project-card:hover {
  transform: translateY(-2px);
  border-color: var(--input-border);
}

.card-critical {
  border-left-color: var(--danger-color);
}

.card-error {
  border-left-color: #e3b341;
}

.card-warning {
  border-left-color: var(--warning-color);
}

.card-resolved {
  border-left-color: var(--success-color);
}

/* Header */
.proj-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.proj-header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.proj-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}

.proj-id {
  font-size: 11px;
  color: var(--text-muted);
}

.proj-header-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Desc */
.proj-desc {
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-tertiary);
  min-height: 42px;
}

/* Stats */
.proj-stats {
  display: flex;
  align-items: center;
  gap: 14px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--text-tertiary);
}

.stat-item svg {
  width: 14px;
  height: 14px;
}

/* Footer */
.proj-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}

.avatars {
  display: flex;
  align-items: center;
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid #161b22;
  margin-right: -6px;
  font-size: 10px;
  font-weight: 700;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.av-owner {
  background: #f85149;
}

.av-manager {
  background: #e3b341;
  color: #000;
}

.av-member {
  background: #58a6ff;
}

.no-members {
  font-size: 12px;
  color: var(--text-muted);
}

.proj-alert-count {
  font-size: 12px;
  color: var(--text-tertiary);
}

/* Badge */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}

.badge-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.badge-critical {
  background: rgba(248,81,73,.12);
  color: var(--danger-color);
}

.badge-critical .badge-dot {
  background: #f85149;
}

.badge-error {
  background: rgba(227,179,65,.12);
  color: #e3b341;
}

.badge-error .badge-dot {
  background: #e3b341;
}

.badge-warning {
  background: rgba(210,153,34,.12);
  color: var(--warning-color);
}

.badge-warning .badge-dot {
  background: #d29922;
}

.badge-resolved {
  background: rgba(63,185,80,.12);
  color: var(--success-color);
}

.badge-resolved .badge-dot {
  background: #3fb950;
}

/* Menu */
.menu-wrap {
  position: relative;
}

.menu-btn {
  background: transparent;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  border-radius: 6px;
  padding: 4px;
  display: flex;
  align-items: center;
}

.menu-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 4px);
  width: 160px;
  background: var(--bg-secondary);
  border: 1px solid var(--input-border);
  border-radius: 10px;
  padding: 4px;
  z-index: 100;
  box-shadow:
    0 8px 24px rgba(0,0,0,.4);
}

.drop-item {
  width: 100%;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 13px;
  border-radius: 6px;
  padding: 8px 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.drop-item:hover {
  background: var(--bg-tertiary);
}

.drop-danger {
  color: var(--danger-color);
}

.drop-danger:hover {
  background:
    rgba(248,81,73,.12);
}

/* Loading */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 80px 0;
  color: var(--text-muted);
}

.loading-icon {
  width: 28px;
  height: 28px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.confirm-modal {
  width: 380px;
  max-width: 90vw;
  background: var(--bg-secondary);
  border: 1px solid var(--input-border);
  border-radius: 12px;
  padding: 24px;
}

.confirm-modal h3 {
  color: var(--text-primary);
  margin-bottom: 12px;
}

.confirm-modal p {
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-tertiary);
}

.confirm-modal strong {
  color: var(--text-primary);
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 22px;
}

.btn-cancel,
.btn-delete {
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 13px;
  cursor: pointer;
}

.btn-cancel {
  background: transparent;
  border: 1px solid var(--input-border);
  color: var(--text-secondary);
}

.btn-cancel:hover {
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.btn-delete {
  background: #f85149;
  color: white;
}

.btn-delete:hover:not(:disabled) {
  background: #da3633;
}

.btn-delete:disabled {
  opacity: .6;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 14px;
  }

  .projects-grid {
    grid-template-columns: 1fr;
  }
}
</style>