// import module
import { ref, onMounted } from 'vue'

// Interface - Định nghĩa cấu trúc của một mục lịch sử tìm kiếm
export interface SearchHistoryItem {
  id: string                                        // ID duy nhất của mỗi mục
  query: string                                     // Chuỗi tìm kiếm
  category: 'alerts' | 'projects' | 'escalation'   // Danh mục tìm kiếm
  timestamp: number                                 // Thời điểm tìm kiếm (Unix ms)
}

// Hằng số - Giới hạn tối đa số lượng lịch sử tìm kiếm được lưu
const MAX_HISTORY = 20

export const useSearchHistory = () => {
  // state - Danh sách lịch sử tìm kiếm (reactive)
  const history = ref<SearchHistoryItem[]>([])

  // Kiểm tra môi trường - Chỉ cho phép truy cập localStorage khi đang chạy trên trình duyệt (client-side)
  // Tránh lỗi "window is not defined" khi render phía server (SSR/Nuxt)
  const isClient = typeof window !== 'undefined'

  // addSearch - Thêm một mục tìm kiếm mới vào đầu danh sách lịch sử
  const addSearch = (query: string, category: 'alerts' | 'projects' | 'escalation' = 'alerts') => {
    // Bỏ qua nếu chuỗi tìm kiếm rỗng hoặc chỉ có khoảng trắng
    if (!query.trim()) return

    // Tạo ID duy nhất cho mục lịch sử bằng timestamp hiện tại
    const id = `search-${Date.now()}`
    const item: SearchHistoryItem = {
      id,
      query,
      category,
      timestamp: Date.now()
    }

    // Remove duplicate if exists (move to top) - Xóa mục trùng lặp (cùng query + category) trước khi thêm mới
    // Đảm bảo mỗi cặp (query, category) chỉ xuất hiện 1 lần trong danh sách
    history.value = history.value.filter(h => !(h.query === query && h.category === category))

    // Add to beginning - Thêm mục mới vào đầu mảng (lịch sử mới nhất hiển thị trên cùng)
    history.value.unshift(item)

    // Keep only MAX_HISTORY items - Giữ tối đa MAX_HISTORY (20) mục, cắt bỏ các mục cũ ở cuối
    if (history.value.length > MAX_HISTORY) {
      history.value = history.value.slice(0, MAX_HISTORY)
    }

    // Lưu danh sách đã cập nhật vào localStorage
    saveHistory()
  }

  // removeSearch - Xóa một mục lịch sử cụ thể theo ID
  const removeSearch = (id: string) => {
    history.value = history.value.filter(h => h.id !== id)
    saveHistory()
  }

  // clearHistory - Xóa toàn bộ lịch sử tìm kiếm (cả trong memory và localStorage)
  const clearHistory = () => {
    history.value = []
    if (isClient) {
      localStorage.removeItem('searchHistory')
    }
  }

  // getHistoryByCategory - Lọc danh sách lịch sử theo danh mục cụ thể
  const getHistoryByCategory = (category: 'alerts' | 'projects' | 'escalation') => {
    return history.value.filter(h => h.category === category)
  }

  // saveHistory - Lưu danh sách lịch sử hiện tại vào localStorage dưới dạng JSON
  const saveHistory = () => {
    if (isClient) {
      localStorage.setItem('searchHistory', JSON.stringify(history.value))
    }
  }

  // loadHistory - Tải lịch sử từ localStorage khi khởi động composable
  // Có try/catch để tránh crash nếu dữ liệu trong localStorage bị hỏng/không hợp lệ
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

  // lifecycle hook - Tự động tải lịch sử từ localStorage ngay khi component được mount
  onMounted(() => {
    loadHistory()
  })

  // Trả về các state và hàm cần thiết để dùng bên ngoài composable
  return {
    history,
    addSearch,
    removeSearch,
    clearHistory,
    getHistoryByCategory
  }
}
