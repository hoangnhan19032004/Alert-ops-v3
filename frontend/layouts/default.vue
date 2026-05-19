<template>
  <div class="app-shell">
    <TheSidebar />

    <main class="app-main">
      <div class="app-content">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import TheSidebar from '~/components/TheSidebar.vue'

// ✅ chỉ init notification system
useNotifications()
</script>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.app-main {
  flex: 1 1 0%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg-page);
  transition: background 0.25s ease;
}

.app-content {
  flex: 1 1 0%;
  min-width: 0;
  overflow-y: auto;
  padding: 28px 32px;
}
</style>