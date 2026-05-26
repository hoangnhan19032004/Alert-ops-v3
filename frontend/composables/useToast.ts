import { ref } from 'vue'

// Định nghĩa cấu trúc của một toast notification
export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning' // 4 loại toast
  duration?: number // Thời gian hiển thị (ms), optional
}

export const useToast = () => {
  const toasts = ref<Toast[]>([]) // Danh sách toast đang hiển thị, dùng ref để Vue theo dõi thay đổi
  let toastId = 0 // Biến đếm để tạo ID duy nhất cho mỗi toast

  // Hàm thêm toast mới vào danh sách
  const addToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration = 3000) => {
    const id = `toast-${++toastId}` // Tạo ID duy nhất bằng cách tăng toastId lên 1 trước khi dùng
    const toast: Toast = {
      id,
      message,
      type,
      duration
    }

    toasts.value.push(toast) // Thêm toast vào cuối danh sách

    // Nếu duration > 0 thì tự động xóa toast sau khoảng thời gian duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id // Trả về ID để có thể xóa toast thủ công nếu cần
  }

  // Hàm xóa toast khỏi danh sách theo ID
  const removeToast = (id: string) => {
    const index = toasts.value.findIndex(t => t.id === id) // Tìm vị trí toast trong mảng
    if (index > -1) {
      toasts.value.splice(index, 1) // Xóa đúng 1 phần tử tại vị trí tìm được
    }
  }

  // Shorthand methods - Gọi nhanh addToast với type tương ứng
  const success = (message: string, duration?: number) => addToast(message, 'success', duration)
  const error = (message: string, duration?: number) => addToast(message, 'error', duration)
  const info = (message: string, duration?: number) => addToast(message, 'info', duration)
  const warning = (message: string, duration?: number) => addToast(message, 'warning', duration)

  // Expose ra ngoài để component khác sử dụng
  return {
    toasts,     // Danh sách toast để render
    addToast,   // Thêm toast tùy chỉnh
    removeToast,// Xóa toast thủ công
    success,
    error,
    info,
    warning
  }
}