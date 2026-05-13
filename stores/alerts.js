// stores/alerts.js
// DEPRECATED: Use composables/useErrorStore.ts and composables/useAlertStore.ts instead
// All mock data has been removed - use API from backend

import { ref } from 'vue'

// This file is kept for backward compatibility but should not be used
// All data is now loaded from the backend API via composables

export const alerts = ref([])
export const projects = ref([])
export const escRules = ref([])

