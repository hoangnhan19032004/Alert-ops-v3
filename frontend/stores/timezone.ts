import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTimezoneStore = defineStore('timezone', () => {
    const defaultTz = Intl.DateTimeFormat().resolvedOptions().timeZone
    // ✅ Dòng này phải check import.meta.client
    const savedTz = import.meta.client
        ? localStorage.getItem('app_timezone')
        : null

    const selectedTimezone = ref<string>(savedTz ?? defaultTz)

    function setTimezone(tz: string) {
        selectedTimezone.value = tz
        if (import.meta.client) {
            localStorage.setItem('app_timezone', tz)
        }
    }

    function formatTime(dt?: string): string {
        if (!dt) return '—'
        const diff = (Date.now() - new Date(dt).getTime()) / 1000
        if (diff < 60) return `${Math.round(diff)}s ago`
        if (diff < 3600) return `${Math.round(diff / 60)}m ago`
        if (diff < 86400) return `${Math.round(diff / 3600)}h ago`
        return new Intl.DateTimeFormat('vi-VN', {
            timeZone: selectedTimezone.value,
            day: '2-digit', month: '2-digit', year: 'numeric'
        }).format(new Date(dt))
    }

    function formatTimeFull(dt?: string): string {
        if (!dt) return '—'
        return new Intl.DateTimeFormat('vi-VN', {
            timeZone: selectedTimezone.value,
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        }).format(new Date(dt))
    }

    return { selectedTimezone, setTimezone, formatTime, formatTimeFull }
})