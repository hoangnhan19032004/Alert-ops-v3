<template>
  <div class="search-box-container">
    <div class="search-input-wrapper">
      <Icon name="lucide:search" class="search-icon" />
      <input
        v-model="searchQuery"
        :placeholder="placeholder"
        class="search-input"
        @input="onSearch"
        @focus="showHistory = true"
        @blur="handleBlur"
      />
      <button
        v-if="searchQuery"
        class="clear-btn"
        @click="clearSearch"
        aria-label="Clear search"
      >
        <Icon name="lucide:x" />
      </button>
    </div>

    <!-- Search History Dropdown -->
    <div v-if="showHistory && history.length > 0" class="search-history">
      <div class="history-header">
        <span class="history-title">Recent Searches</span>
        <button class="clear-history-btn" @click="handleClearHistory" title="Clear history">
          <Icon name="lucide:trash-2" />
        </button>
      </div>
      <button
        v-for="item in history"
        :key="item.id"
        class="history-item"
        @click="selectHistoryItem(item)"
      >
        <Icon name="lucide:clock" />
        <span class="history-query">{{ item.query }}</span>
        <span class="history-time">{{ formatTime(item.timestamp) }}</span>
        <button
          class="remove-btn"
          @click.stop="removeHistory(item.id)"
        >
          <Icon name="lucide:x" />
        </button>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// import module
import { ref, computed } from 'vue'
import { useSearchHistory } from '~/composables/useSearchHistory'

// props
const props = defineProps<{
  placeholder?: string
  category?: 'alerts' | 'projects' | 'escalation'
}>()

// emit
const emit = defineEmits<{
  search: [query: string]
}>()

// composable
const { history: allHistory, addSearch, removeSearch, clearHistory: clearAllHistory } = useSearchHistory()

// state
const searchQuery = ref('')
const showHistory = ref(false)

// computed
const category = computed(() => props.category || 'alerts')
const placeholder = computed(() => props.placeholder || 'Search...')

const history = computed(() => {
  return allHistory.value.filter(h => h.category === category.value).slice(0, 10)
})

const onSearch = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  emit('search', value)
  
  if (value.trim()) {
    addSearch(value, category.value)
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  emit('search', '')
  showHistory.value = false
}

const selectHistoryItem = (item: any) => {
  searchQuery.value = item.query
  emit('search', item.query)
  showHistory.value = false
}

const removeHistory = (id: string) => {
  removeSearch(id)
}

const handleClearHistory = () => {
  if (confirm('Clear all search history?')) {
    clearAllHistory()
  }
}

const handleBlur = () => {
  // Delay to allow click on history items
  setTimeout(() => {
    showHistory.value = false
  }, 100)
}

const formatTime = (timestamp: number) => {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  
  return new Date(timestamp).toLocaleDateString()
}
</script>

<style scoped>
.search-box-container {
  position: relative;
  width: 100%;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  width: 16px;
  height: 16px;
  color: var(--text-tertiary);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  background: var(--bg-secondary);
  border: 1px solid #1e2735;
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 0.9286rem;
  transition: all 0.15s;
}

.search-input:hover {
  border-color: var(--input-border);
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(88, 166, 255, 0.1);
  background: var(--bg-primary);
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.clear-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.15s;
}

.clear-btn:hover {
  color: var(--text-secondary);
}

.search-history {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--bg-secondary);
  border: 1px solid #1e2735;
  border-top: none;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  margin-top: -1px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 100;
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid #1e2735;
  position: sticky;
  top: 0;
  background: var(--bg-secondary);
}

.history-title {
  font-size: 0.7857rem;
  font-weight: 700;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.clear-history-btn {
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.15s;
}

.clear-history-btn:hover {
  color: var(--danger-color);
}

.history-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.9286rem;
  text-align: left;
  transition: background 0.15s;
}

.history-item:hover {
  background: var(--bg-primary);
}

.history-item svg {
  width: 14px;
  height: 14px;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.history-query {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-time {
  font-size: 0.7857rem;
  color: var(--text-tertiary);
  white-space: nowrap;
  flex-shrink: 0;
}

.remove-btn {
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  opacity: 0;
  transition: all 0.15s;
  flex-shrink: 0;
}

.history-item:hover .remove-btn {
  opacity: 1;
  color: var(--danger-color);
}

.remove-btn:hover {
  color: var(--danger-color);
}

.remove-btn svg {
  width: 14px;
  height: 14px;
}
</style>
