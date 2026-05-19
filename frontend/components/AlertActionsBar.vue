<template>
  <div class="alert-actions-bar">
    <div class="actions-left">
      <button
        v-if="selectedCount > 0"
        class="action-btn clear-btn"
        @click="clearSelection"
        :title="`${t('clearSelection')} (${selectedCount} ${t('selected')})`"
      >
        <Icon name="lucide:x" />
        Clear ({{ selectedCount }})
      </button>
      <div v-else class="actions-info">
        <span>
          <Icon name="lucide:info" />
          Tip: Select multiple alerts for bulk actions
        </span>
      </div>
    </div>

    <div class="actions-right">
      <div class="action-group">
        <button
          class="action-btn"
          @click="showExportMenu = !showExportMenu"
          :title="t('exportAlerts')"
        >
          <Icon name="lucide:download" />
          Export
        </button>

        <div v-if="showExportMenu" class="export-menu">
          <button class="export-item" @click="handleExportCSV">
            <Icon name="lucide:file-text" />
            Export as CSV
          </button>
          <button class="export-item" @click="handleExportJSON">
            <Icon name="lucide:code" />
            Export as JSON
          </button>
        </div>
      </div>

      <button
        v-if="selectedCount > 0"
        class="action-btn danger-btn"
        @click="handleBulkDelete"
        :title="t('deleteSelected')"
      >
        <Icon name="lucide:trash-2" />
        Delete
      </button>

      <button
        v-if="selectedCount > 0"
        class="action-btn success-btn"
        @click="handleBulkResolve"
        :title="t('resolveSelected')"
      >
        <Icon name="lucide:check" />
        Resolve
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '~/composables/useI18n'
import { useAlertExport } from '~/composables/useAlertExport'
import { useToast } from '~/composables/useToast'

const props = defineProps<{
  selectedCount: number
  selectedAlerts: any[]
  alerts: any[]
}>()

const emit = defineEmits<{
  clearSelection: []
  bulkDelete: []
  bulkResolve: []
}>()

const { exportToCSV, exportToJSON } = useAlertExport()
const { t } = useI18n()
const { success, info, error } = useToast()
const showExportMenu = ref(false)

const clearSelection = () => {
  emit('clearSelection')
}

const handleExportCSV = () => {
  if (props.selectedCount > 0) {
    exportToCSV(props.selectedAlerts, `alerts-export-${new Date().toISOString().slice(0, 10)}.csv`)
  } else {
    exportToCSV(props.alerts, `alerts-export-${new Date().toISOString().slice(0, 10)}.csv`)
  }
  success('Alerts exported as CSV')
  showExportMenu.value = false
}

const handleExportJSON = () => {
  if (props.selectedCount > 0) {
    exportToJSON(props.selectedAlerts, `alerts-export-${new Date().toISOString().slice(0, 10)}.json`)
  } else {
    exportToJSON(props.alerts, `alerts-export-${new Date().toISOString().slice(0, 10)}.json`)
  }
  success('Alerts exported as JSON')
  showExportMenu.value = false
}

const handleBulkDelete = () => {
  if (confirm(`Delete ${props.selectedCount} alert${props.selectedCount > 1 ? 's' : ''}?`)) {
    emit('bulkDelete')
    success(`${props.selectedCount} alert${props.selectedCount > 1 ? 's' : ''} deleted`)
  }
}

const handleBulkResolve = () => {
  emit('bulkResolve')
  success(`${props.selectedCount} alert${props.selectedCount > 1 ? 's' : ''} marked as resolved`)
}
</script>

<style scoped>
.alert-actions-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #161b22;
  border: 1px solid #1e2735;
  border-radius: 8px;
  margin-bottom: 16px;
  gap: 16px;
}

.actions-left,
.actions-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.actions-left {
  flex: 1;
}

.actions-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #8b949e;
}

.actions-info svg {
  width: 16px;
  height: 16px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: transparent;
  border: 1px solid #30363d;
  border-radius: 6px;
  color: #c9d1d9;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.15s;
  white-space: nowrap;
  position: relative;
}

.action-btn:hover {
  border-color: #8b949e;
  color: #e6edf3;
  background: #0d1117;
}

.action-btn svg {
  width: 16px;
  height: 16px;
}

.clear-btn {
  border-color: #f85149;
  color: #f85149;
}

.clear-btn:hover {
  background: rgba(248, 81, 73, 0.1);
  border-color: #f85149;
}

.danger-btn {
  border-color: #f85149;
  color: #f85149;
}

.danger-btn:hover {
  background: rgba(248, 81, 73, 0.1);
}

.success-btn {
  border-color: #3fb950;
  color: #3fb950;
}

.success-btn:hover {
  background: rgba(63, 185, 80, 0.1);
}

.action-group {
  position: relative;
}

.export-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: #161b22;
  border: 1px solid #1e2735;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  margin-top: 4px;
  z-index: 100;
  min-width: 150px;
}

.export-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: none;
  border: none;
  color: #c9d1d9;
  cursor: pointer;
  font-size: 12px;
  text-align: left;
  transition: all 0.15s;
}

.export-item:hover {
  background: #0d1117;
  color: #e6edf3;
}

.export-item:first-child {
  border-radius: 6px 6px 0 0;
}

.export-item:last-child {
  border-radius: 0 0 6px 6px;
}

.export-item svg {
  width: 14px;
  height: 14px;
}
</style>
