<template>
  <div class="page-wrap">
    <div class="page-header">
      <div>
        <h1 class="page-title">API Connection Test</h1>
        <p class="page-sub">Test backend API connectivity and create sample errors</p>
      </div>
    </div>

    <!-- Connection Status -->
    <div class="section-card">
      <div class="section-label">API Status</div>
      <div class="status-grid">
        <div class="status-item">
          <div class="status-icon" :class="{ connected: apiConnected }">
            <Icon :name="apiConnected ? 'lucide:check-circle' : 'lucide:x-circle'" />
          </div>
          <div class="status-info">
            <div class="status-title">Backend API</div>
            <div class="status-desc">
              {{ apiConnected ? 'Connected to ErrorAlertAPI' : 'Cannot connect to backend' }}
            </div>
            <div class="status-url">{{ baseURL }}</div>
          </div>
        </div>
        <div class="status-item">
          <div class="status-icon" :class="{ connected: mongoConnected }">
            <Icon :name="mongoConnected ? 'lucide:database' : 'lucide:database-x'" />
          </div>
          <div class="status-info">
            <div class="status-title">MongoDB</div>
            <div class="status-desc">
              {{ mongoConnected ? 'Database connection OK' : 'Database connection failed' }}
            </div>
          </div>
        </div>
      </div>
      <div class="action-buttons">
        <button @click="testConnection" class="btn-primary" :disabled="testing">
          <Icon name="lucide:refresh-ccw" />
          Test Connection
        </button>
        <button @click="loadAlerts" class="btn-secondary" :disabled="loading">
          <Icon name="lucide:download" />
          Load Alerts
        </button>
      </div>
    </div>

    <!-- Create Test Error -->
    <div class="section-card">
      <div class="section-label">Create Test Error</div>
      <form @submit.prevent="createTestError" class="test-form">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Service</label>
            <input
              v-model="testError.service"
              type="text"
              class="form-input"
              placeholder="e.g., test-service"
              required
            />
          </div>
          <div class="form-group">
            <label class="form-label">Severity</label>
            <select v-model="testError.severity" class="form-select" required>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Message</label>
          <textarea
            v-model="testError.message"
            class="form-textarea"
            placeholder="Error message..."
            rows="3"
            required
          ></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Stack Trace</label>
          <textarea
            v-model="testError.stackTrace"
            class="form-textarea"
            placeholder="Stack trace (optional)..."
            rows="4"
          ></textarea>
        </div>
        <button type="submit" class="btn-submit" :disabled="!apiConnected || creating">
          <Icon name="lucide:plus" />
          Create Test Error
        </button>
      </form>
    </div>

    <!-- Recent Errors -->
    <div class="section-card">
      <div class="section-label">Recent API Errors ({{ errorCount }})</div>
      <div v-if="loading" class="loading-state">
        <Icon name="lucide:loader-2" class="loading-icon" />
        <p>Loading errors...</p>
      </div>
      <div v-else-if="alerts.length === 0" class="empty-state">
        <Icon name="lucide:inbox" />
        <p>No errors found</p>
      </div>
      <div v-else class="error-list">
        <div
          v-for="error in alerts.slice(0, 10)"
          :key="error.id"
          class="error-item"
          :class="`severity-${error.severity.toLowerCase()}`"
        >
          <div class="error-header">
            <span class="error-id">{{ error.id }}</span>
            <span class="error-severity">{{ error.severity }}</span>
            <span class="error-time">{{ formatTime(error.createdAt) }}</span>
          </div>
          <div class="error-service">{{ error.service }}</div>
          <div class="error-message">{{ error.message }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { baseURL } = useApi()

const {
  alerts,
  loading,
  apiConnected,
  loadAlerts,
  createAlert,
  checkConnection
} = useErrorStore()

const { success, error: showError } = useToast()

const testing = ref(false)
const creating = ref(false)
const mongoConnected = ref(false)

const testError = ref({
  service: 'test-service',
  severity: 'high',
  message: 'This is a test error created from frontend',
  stackTrace: ''
})

const errorCount = computed(() => alerts.value.length)

const testConnection = async () => {
  testing.value = true
  try {
    const apiOk = await checkConnection()

    if (apiOk) {
      await loadAlerts()
      mongoConnected.value = true
      success('API OK + MongoDB OK')
    } else {
      mongoConnected.value = false
    }
  } catch {
    showError('Connection test failed')
    mongoConnected.value = false
  } finally {
    testing.value = false
  }
}

const createTestError = async () => {
  creating.value = true
  try {
    const ok = await createAlert({
      message: testError.value.message,
      service: testError.value.service,
      severity: testError.value.severity
    })

    if (ok) {
      testError.value.message = ''
    }
  } finally {
    creating.value = false
  }
}

const formatTime = (date?: string) => {
  return date ? new Date(date).toLocaleString() : 'Just now'
}

onMounted(() => {
  testConnection()
})
</script>

<style scoped>
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 22px; }
.page-title  { font-size: 22px; font-weight: 700; color: #e6edf3; }
.page-sub    { font-size: 13px; color: #586069; margin-top: 3px; }

.section-card { background: #161b22; border: 1px solid #21262d; border-radius: 10px; padding: 20px; margin-bottom: 20px; }
.section-label { font-size: 11px; font-weight: 600; color: #586069; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 16px; }

.status-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; margin-bottom: 20px; }
.status-item { display: flex; align-items: center; gap: 12px; padding: 16px; background: #0d1117; border: 1px solid #1e2735; border-radius: 8px; }
.status-icon { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 8px; }
.status-icon.connected { background: rgba(63,185,80,.15); color: #3fb950; }
.status-icon:not(.connected) { background: rgba(248,81,73,.15); color: #f85149; }
.status-info { flex: 1; }
.status-title { font-weight: 600; color: #e6edf3; margin-bottom: 4px; }
.status-desc { font-size: 13px; color: #8b949e; margin-bottom: 4px; }
.status-url { font-family: 'Courier New', monospace; font-size: 12px; color: #58a6ff; }

.action-buttons { display: flex; gap: 12px; }
.btn-primary, .btn-secondary, .btn-submit {
  display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 6px;
  font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s;
}
.btn-primary { background: #238636; border: 1px solid #238636; color: #fff; }
.btn-primary:hover:not(:disabled) { background: #2ea043; }
.btn-secondary { background: transparent; border: 1px solid #30363d; color: #c9d1d9; }
.btn-secondary:hover:not(:disabled) { border-color: #58a6ff; color: #58a6ff; }
.btn-submit { background: #1f6feb; border: 1px solid #1f6feb; color: #fff; }
.btn-submit:hover:not(:disabled) { background: #388bfd; }
.btn-primary:disabled, .btn-secondary:disabled, .btn-submit:disabled {
  background: #30363d; border-color: #30363d; cursor: not-allowed; opacity: 0.6;
}

.test-form { max-width: 600px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
.form-group { margin-bottom: 16px; }
.form-label { display: block; font-size: 13px; font-weight: 600; color: #c9d1d9; margin-bottom: 6px; }
.form-input, .form-select, .form-textarea {
  width: 100%; padding: 8px 12px; background: #0d1117; border: 1px solid #1e2735; border-radius: 6px;
  color: #c9d1d9; font-size: 13px; transition: border-color 0.15s;
}
.form-input:focus, .form-select:focus, .form-textarea:focus {
  outline: none; border-color: #58a6ff;
}
.form-textarea { resize: vertical; min-height: 80px; }

.loading-state, .empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 40px 20px; color: #8b949e; text-align: center;
}
.loading-icon { width: 32px; height: 32px; margin-bottom: 16px; animation: spin 1s linear infinite; }
.empty-state svg { width: 48px; height: 48px; margin-bottom: 16px; opacity: 0.5; }

.error-list { display: flex; flex-direction: column; gap: 12px; }
.error-item {
  padding: 16px; background: #0d1117; border: 1px solid #1e2735; border-radius: 8px;
  border-left: 4px solid #8b949e;
}
.error-item.severity-high { border-left-color: #f85149; }
.error-item.severity-medium { border-left-color: #e3b341; }
.error-item.severity-low { border-left-color: #3fb950; }
.error-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.error-id { font-family: 'Courier New', monospace; font-size: 12px; color: #58a6ff; font-weight: 600; }
.error-severity {
  padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;
  background: rgba(248,81,73,.15); color: #f85149;
}
.error-severity:has(.severity-medium) { background: rgba(227,179,65,.15); color: #e3b341; }
.error-severity:has(.severity-low) { background: rgba(63,185,80,.15); color: #3fb950; }
.error-time { font-size: 12px; color: #586069; margin-left: auto; }
.error-service { font-family: 'Courier New', monospace; font-size: 12px; color: #8b949e; margin-bottom: 4px; }
.error-message { font-size: 13px; color: #c9d1d9; line-height: 1.4; }

@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.page-wrap { width: 100%; min-width: 0; }
</style>
