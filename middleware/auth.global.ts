// middleware/auth.global.ts
// Runs on every navigation. Redirects unauthenticated users to /login.

export default defineNuxtRouteMiddleware((to) => {
  // Public pages that don't require auth
  const publicPages = ['/login', '/logout']
  if (publicPages.includes(to.path)) return

  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('alertops_user')
    if (!saved) {
      return navigateTo('/login')
    }
  }
})
