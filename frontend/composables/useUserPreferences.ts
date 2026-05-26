import { ref, onMounted } from 'vue'
import type { Language } from './useI18n'

// Định nghĩa cấu trúc preferences của người dùng
export interface UserPreferences {
  theme: 'dark' | 'light' | 'auto'   // Giao diện sáng/tối/tự động
  language: Language                   // Ngôn ngữ, lấy type từ useI18n
  emailNotifications: boolean          // Bật/tắt thông báo qua email
  slackNotifications: boolean          // Bật/tắt thông báo qua Slack
  autoRefreshAlerts: boolean           // Bật/tắt tự động làm mới alerts
  refreshInterval: number              // Thời gian làm mới (giây)
  alertsPerPage: number                // Số alerts hiển thị mỗi trang
  compactView: boolean                 // Bật/tắt chế độ hiển thị thu gọn
}

// Giá trị mặc định khi người dùng chưa có preferences hoặc reset
const defaultPreferences: UserPreferences = {
  theme: 'auto',
  language: 'vi',
  emailNotifications: true,
  slackNotifications: true,
  autoRefreshAlerts: true,
  refreshInterval: 30,
  alertsPerPage: 10,
  compactView: false
}

export const useUserPreferences = () => {
  // Khởi tạo preferences với giá trị mặc định, spread để tránh mutate object gốc
  const preferences = ref<UserPreferences>({ ...defaultPreferences })

  // Hàm load preferences từ localStorage
  const loadPreferences = () => {
    if (import.meta.client) { // Kiểm tra đang chạy ở client (tránh lỗi SSR vì server không có localStorage)
      const saved = localStorage.getItem('userPreferences')
      if (saved) {
        try {
          preferences.value = {
            ...defaultPreferences, // Lấy default trước để đảm bảo không thiếu field nào
            ...JSON.parse(saved)   // Ghi đè bằng giá trị đã lưu
          }
        } catch (e) {
          // Nếu JSON bị lỗi/corrupt thì giữ nguyên default, không crash app
          console.error('Failed to parse preferences:', e)
        }
      }
    }
  }

  // Hàm lưu preferences — chỉ cần truyền vào những field muốn thay đổi (Partial)
  const savePreferences = (newPrefs: Partial<UserPreferences>) => {
    preferences.value = {
      ...preferences.value, // Giữ lại các field cũ
      ...newPrefs           // Ghi đè bằng field mới
    }

    if (import.meta.client) {
      // Lưu toàn bộ preferences xuống localStorage dưới dạng JSON string
      localStorage.setItem('userPreferences', JSON.stringify(preferences.value))
    }
  }

  // Hàm reset preferences về mặc định và xóa khỏi localStorage
  const resetPreferences = () => {
    preferences.value = { ...defaultPreferences }

    if (import.meta.client) {
      localStorage.removeItem('userPreferences')
    }
  }

  // Load preferences khi component được mount
  onMounted(() => {
    loadPreferences()
  })

  return {
    preferences,      // Preferences hiện tại để dùng trong template
    loadPreferences,  // Gọi thủ công nếu cần reload
    savePreferences,  // Cập nhật một hoặc nhiều field
    resetPreferences  // Reset về mặc định
  }
}