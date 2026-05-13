<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useTheme } from '~/composables/useTheme'
import { useI18n } from '~/composables/useI18n'

useTheme()
useI18n()
</script>

<style>
/* ─── CSS Variables: Dark (default) ─── */
:root,
:root.dark {
  --bg-page:      #0d1117;
  --bg-primary:   #0d1117;
  --bg-secondary: #161b22;
  --bg-tertiary:  #1e2735;
  --border-color: #21262d;
  --text-primary:   #e6edf3;
  --text-secondary: #c9d1d9;
  --text-tertiary:  #8b949e;
  --accent-color: #58a6ff;
  --accent-hover: #79c0ff;
}

/* ─── CSS Variables: Light ─── */
:root.light {
  --bg-page:      #f0f2f5;
  --bg-primary:   #f0f2f5;
  --bg-secondary: #ffffff;
  --bg-tertiary:  #eaeef2;
  --border-color: #d0d7de;
  --text-primary:   #1c2128;
  --text-secondary: #36454f;
  --text-tertiary:  #6e7781;
  --accent-color: #0969da;
  --accent-hover: #0550ae;
}

/* ─── Reset ─── */
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

html, body {
  height: 100%;
  font-family: 'Segoe UI', system-ui, sans-serif;
  background: var(--bg-page);
  color: var(--text-secondary);
  overflow: hidden;
  transition: background 0.25s ease, color 0.25s ease;
}

/* Nuxt mount point */
#__nuxt {
  height: 100vh;
  display: flex;
  flex-direction: row;
  overflow: hidden;
}

/* Shell: sidebar + main side by side */
.app-shell {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

/* Main area */
.app-main {
  flex: 1 1 0%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg-page);
  transition: background 0.25s ease;
}

/* Scrollable content */
.app-content {
  flex: 1 1 0%;
  min-width: 0;
  overflow-y: auto;
  padding: 28px 32px;
}

/* Scrollbar */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--bg-page); }
::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--text-tertiary); }
</style>
