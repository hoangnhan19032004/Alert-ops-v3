import { ref, computed } from 'vue'

export interface User {
  id: string
  username: string
  fullName: string
  role: 'Manager' 
  avatar: string
  email: string
  lastLogin?: string
}

// Mock users — thay bằng API call thực tế
const MOCK_USERS = [
  { username: 'trinm22',  password: 'fpt123',  fullName: 'Trí Nguyễn',   role: 'Manager', email: 'trinm22@fpt.com',  avatar: 'TN' },
]

// Singleton state
const currentUser = ref<User | null>(null)
const isLoading   = ref(false)
const authError   = ref('')

const isClient = typeof window !== 'undefined'

export const useAuth = () => {
  const isAuthenticated = computed(() => currentUser.value !== null)

  // Restore session on mount
  const restoreSession = () => {
    if (isClient) {
      const saved = localStorage.getItem('alertops_user')
      if (saved) {
        try { currentUser.value = JSON.parse(saved) } catch { /* ignore */ }
      }
    }
  }

  const login = async (username: string, password: string): Promise<boolean> => {
    isLoading.value = true
    authError.value = ''

    // Simulate network delay
    await new Promise(r => setTimeout(r, 900))

    const found = MOCK_USERS.find(
      u => u.username === username.trim() && u.password === password
    )

    if (found) {
      const user: User = {
        id:        `user-${found.username}`,
        username:  found.username,
        fullName:  found.fullName,
        role:      found.role as User['role'],
        avatar:    found.avatar,
        email:     found.email,
        lastLogin: new Date().toISOString(),
      }
      currentUser.value = user
      if (isClient) localStorage.setItem('alertops_user', JSON.stringify(user))
      isLoading.value = false
      return true
    }

    authError.value = 'Tên đăng nhập hoặc mật khẩu không đúng'
    isLoading.value = false
    return false
  }

  const logout = () => {
    currentUser.value = null
    if (isClient) localStorage.removeItem('alertops_user')
  }

  const clearError = () => { authError.value = '' }

  return {
    currentUser,
    isAuthenticated,
    isLoading,
    authError,
    login,
    logout,
    restoreSession,
    clearError,
  }
}
