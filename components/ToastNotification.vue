<template>
  <div class="toast-container">
    <transition-group name="toast" tag="div">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="`toast-${toast.type}`"
      >
        <div class="toast-icon">
          <Icon v-if="toast.type === 'success'" name="lucide:check-circle" />
          <Icon v-else-if="toast.type === 'error'" name="lucide:alert-circle" />
          <Icon v-else-if="toast.type === 'warning'" name="lucide:alert-triangle" />
          <Icon v-else name="lucide:info" />
        </div>
        <div class="toast-message">{{ toast.message }}</div>
        <button class="toast-close" @click="removeToast(toast.id)">
          <Icon name="lucide:x" />
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '~/composables/useToast'

const { toasts, removeToast } = useToast()
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin-top: 12px;
  border-radius: 8px;
  background: #161b22;
  border: 1px solid #1e2735;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  pointer-events: all;
  min-width: 300px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(400px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.toast-success {
  border-color: #3fb950;
  background: rgba(63, 185, 80, 0.05);
}

.toast-error {
  border-color: #f85149;
  background: rgba(248, 81, 73, 0.05);
}

.toast-warning {
  border-color: #d29922;
  background: rgba(210, 153, 34, 0.05);
}

.toast-info {
  border-color: #58a6ff;
  background: rgba(88, 166, 255, 0.05);
}

.toast-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.toast-success .toast-icon { color: #3fb950; }
.toast-error .toast-icon { color: #f85149; }
.toast-warning .toast-icon { color: #d29922; }
.toast-info .toast-icon { color: #58a6ff; }

.toast-message {
  flex: 1;
  font-size: 13px;
  color: #c9d1d9;
  font-weight: 500;
}

.toast-close {
  background: none;
  border: none;
  color: #8b949e;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.15s;
  flex-shrink: 0;
}

.toast-close:hover {
  color: #c9d1d9;
}

/* Transition animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(400px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(400px);
}
</style>
