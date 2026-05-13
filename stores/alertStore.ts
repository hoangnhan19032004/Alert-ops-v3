import { defineStore } from 'pinia'
import type { Alert } from '~/types' // Import từ file vừa tạo

export const useAlertStore = defineStore('alertStore', () => {
  // Ép kiểu mảng Alert cho ref
  const alerts = ref<Alert[]>([]); 
  const loading = ref(false);

  async function fetchAlerts() {
    loading.value = true;
    try {
      // Sử dụng $fetch hoặc useFetch và định nghĩa kiểu trả về
      const data = await $fetch<Alert[]>('http://localhost:5000/api/alerts');
      if (data) {
        alerts.value = data;
      }
    } catch (err) {
      console.error("Lỗi:", err);
      alerts.value = []; // Nếu lỗi thì trả về mảng rỗng thay vì undefined
    } finally {
      loading.value = false;
    }
  }

  return { alerts, loading, fetchAlerts };
});