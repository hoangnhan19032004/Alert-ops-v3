import { ref, onMounted } from 'vue'

export interface SearchHistoryItem {
  id: string
  query: string
  category: 'alerts' | 'projects' | 'escalation'
  timestamp: number
}

const MAX_HISTORY = 20

export const useSearchHistory = () => {
  const history = ref<SearchHistoryItem[]>([])

  const addSearch = (query: string, category: 'alerts' | 'projects' | 'escalation' = 'alerts') => {
    if (!query.trim()) return

    const id = `search-${Date.now()}`
    const item: SearchHistoryItem = {
      id,
      query,
      category,
      timestamp: Date.now()
    }

    // Remove duplicate if exists (move to top)
    history.value = history.value.filter(h => !(h.query === query && h.category === category))

    // Add to beginning
    history.value.unshift(item)

    // Keep only MAX_HISTORY items
    if (history.value.length > MAX_HISTORY) {
      history.value = history.value.slice(0, MAX_HISTORY)
    }

    saveHistory()
  }

  const removeSearch = (id: string) => {
    history.value = history.value.filter(h => h.id !== id)
    saveHistory()
  }

  const isClient = typeof window !== 'undefined'

  const clearHistory = () => {
    history.value = []
    if (isClient) {
      localStorage.removeItem('searchHistory')
    }
  }

  const getHistoryByCategory = (category: 'alerts' | 'projects' | 'escalation') => {
    return history.value.filter(h => h.category === category)
  }

  const saveHistory = () => {
    if (isClient) {
      localStorage.setItem('searchHistory', JSON.stringify(history.value))
    }
  }

  const loadHistory = () => {
    if (isClient) {
      const saved = localStorage.getItem('searchHistory')
      if (saved) {
        try {
          history.value = JSON.parse(saved)
        } catch (e) {
          console.error('Failed to load search history:', e)
        }
      }
    }
  }

  onMounted(() => {
    loadHistory()
  })

  return {
    history,
    addSearch,
    removeSearch,
    clearHistory,
    getHistoryByCategory
  }
}
