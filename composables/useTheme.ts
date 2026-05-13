import { ref, watch, onMounted } from 'vue'

export const useTheme = () => {
  const theme = ref<'dark' | 'light' | 'auto'>('auto')
  const systemPreference = ref<'dark' | 'light'>('dark')

  const setTheme = (newTheme: 'dark' | 'light' | 'auto') => {
    theme.value = newTheme
    localStorage.setItem('theme', newTheme)
    
    if (import.meta.client) {
      const html = document.documentElement
      let actualTheme: 'dark' | 'light'
      if (newTheme === 'auto') {
        actualTheme = systemPreference.value
      } else {
        actualTheme = newTheme
      }
      
      if (actualTheme === 'dark') {
        html.classList.add('dark')
        html.classList.remove('light')
      } else {
        html.classList.add('light')
        html.classList.remove('dark')
      }
    }
  }

  const toggleTheme = () => {
    const currentActual = theme.value === 'auto' ? systemPreference.value : theme.value
    setTheme(currentActual === 'dark' ? 'light' : 'dark')
  }

  const detectSystemPreference = () => {
    if (import.meta.client && window.matchMedia) {
      if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        systemPreference.value = 'light'
      } else {
        systemPreference.value = 'dark'
      }
    }
  }

  onMounted(() => {
    detectSystemPreference()
    
    // Load từ localStorage
    const saved = localStorage.getItem('theme')
    if (saved === 'light' || saved === 'dark' || saved === 'auto') {
      setTheme(saved as 'dark' | 'light' | 'auto')
    } else {
      setTheme('auto')
    }
  })

  return {
    theme,
    systemPreference,
    setTheme,
    toggleTheme,
    detectSystemPreference
  }
}
