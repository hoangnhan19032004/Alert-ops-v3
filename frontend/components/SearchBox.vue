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
import { ref, computed } from 'vue'
import { useSearchHistory } from '~/composables/useSearchHistory'

const props = defineProps<{
  placeholder?: string
  category?: 'alerts' | 'projects' | 'escalation'
}>()

const emit = defineEmits<{
  search: [query: string]
}>()

const { history: allHistory, addSearch, removeSearch, clearHistory: clearAllHistory } = useSearchHistory()

const searchQuery = ref('')
const showHistory = ref(false)

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
  color: #8b949e;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  background: #161b22;
  border: 1px solid #1e2735;
  border-radius: 8px;
  color: #c9d1d9;
  font-size: 13px;
  transition: all 0.15s;
}

.search-input:hover {
  border-color: #30363d;
}

.search-input:focus {
  outline: none;
  border-color: #58a6ff;
  box-shadow: 0 0 0 2px rgba(88, 166, 255, 0.1);
  background: #0d1117;
}

.search-input::placeholder {
  color: #8b949e;
}

.clear-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #8b949e;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.15s;
}

.clear-btn:hover {
  color: #c9d1d9;
}

.search-history {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #161b22;
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
  background: #161b22;
}

.history-title {
  font-size: 11px;
  font-weight: 700;
  color: #8b949e;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.clear-history-btn {
  background: none;
  border: none;
  color: #8b949e;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.15s;
}

.clear-history-btn:hover {
  color: #f85149;
}

.history-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: none;
  border: none;
  color: #c9d1d9;
  cursor: pointer;
  font-size: 13px;
  text-align: left;
  transition: background 0.15s;
}

.history-item:hover {
  background: #0d1117;
}

.history-item svg {
  width: 14px;
  height: 14px;
  color: #8b949e;
  flex-shrink: 0;
}

.history-query {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-time {
  font-size: 11px;
  color: #8b949e;
  white-space: nowrap;
  flex-shrink: 0;
}

.remove-btn {
  background: none;
  border: none;
  color: #8b949e;
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
  color: #f85149;
}

.remove-btn:hover {
  color: #f85149;
}

.remove-btn svg {
  width: 14px;
  height: 14px;
}
</style>
