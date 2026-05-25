<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useTheme } from '~/composables/useTheme'
import { useI18n } from '~/composables/useI18n'
import { useAuth } from '~/composables/useAuth'

useTheme()
useI18n()

const { restoreSession } = useAuth()
if (import.meta.client) {
  await restoreSession()
}
</script>

<style>
/* ═══════════════════════════════════════════
   DARK THEME (default)
═══════════════════════════════════════════ */
:root,
:root.dark {
  --bg-page:        #0d1117;
  --bg-primary:     #0d1117;
  --bg-secondary:   #161b22;
  --bg-tertiary:    #1e2735;
  --bg-hover:       #1f2937;

  --border-color:   #21262d;
  --border-hover:   #30363d;

  --text-primary:   #e6edf3;
  --text-secondary: #c9d1d9;
  --text-tertiary:  #8b949e;
  --text-muted:     #6e7681;

  --accent-color:   #58a6ff;
  --accent-hover:   #79c0ff;
  --accent-subtle:  rgba(88, 166, 255, 0.12);

  --danger-color:   #f85149;
  --danger-hover:   #ff6b6b;
  --danger-subtle:  rgba(248, 81, 73, 0.12);

  --success-color:  #3fb950;
  --success-subtle: rgba(63, 185, 80, 0.12);

  --warning-color:  #d29922;
  --warning-subtle: rgba(210, 153, 34, 0.12);

  --info-color:     #58a6ff;
  --info-subtle:    rgba(88, 166, 255, 0.12);

  /* Status badge colors */
  --badge-critical-bg:   rgba(248, 81, 73, 0.15);
  --badge-critical-text: #f85149;
  --badge-error-bg:      rgba(210, 153, 34, 0.15);
  --badge-error-text:    #d29922;
  --badge-warning-bg:    rgba(255, 166, 0, 0.15);
  --badge-warning-text:  #ffa600;
  --badge-info-bg:       rgba(88, 166, 255, 0.15);
  --badge-info-text:     #58a6ff;

  /* Table */
  --table-header-bg:  #0d1117;
  --table-row-bg:     #0d1117;
  --table-row-hover:  #161b22;
  --table-row-alt:    #0f1419;

  /* Input */
  --input-bg:         #0d1117;
  --input-border:     #30363d;
  --input-text:       #e6edf3;

  /* Modal / Card */
  --card-bg:          #161b22;
  --card-border:      #21262d;
  --shadow-sm:        0 1px 3px rgba(0,0,0,0.3);
  --shadow-md:        0 4px 12px rgba(0,0,0,0.4);
  --shadow-lg:        0 10px 30px rgba(0,0,0,0.5);

  color-scheme: dark;
}

/* ═══════════════════════════════════════════
   LIGHT THEME
═══════════════════════════════════════════ */
:root.light {
  --bg-page:        #f5f7fa;
  --bg-primary:     #f5f7fa;
  --bg-secondary:   #ffffff;
  --bg-tertiary:    #eef1f6;
  --bg-hover:       #e8edf4;

  --border-color:   #d0d7de;
  --border-hover:   #b6c0cc;

  --text-primary:   #1c2128;
  --text-secondary: #2d3748;
  --text-tertiary:  #5a6a7e;
  --text-muted:     #8896a5;

  --accent-color:   #0969da;
  --accent-hover:   #0550ae;
  --accent-subtle:  rgba(9, 105, 218, 0.1);

  --danger-color:   #cf222e;
  --danger-hover:   #a40e26;
  --danger-subtle:  rgba(207, 34, 46, 0.1);

  --success-color:  #1a7f37;
  --success-subtle: rgba(26, 127, 55, 0.1);

  --warning-color:  #9a6700;
  --warning-subtle: rgba(154, 103, 0, 0.1);

  --info-color:     #0969da;
  --info-subtle:    rgba(9, 105, 218, 0.1);

  /* Status badge colors */
  --badge-critical-bg:   rgba(207, 34, 46, 0.1);
  --badge-critical-text: #cf222e;
  --badge-error-bg:      rgba(154, 103, 0, 0.1);
  --badge-error-text:    #9a6700;
  --badge-warning-bg:    rgba(130, 80, 0, 0.1);
  --badge-warning-text:  #82500a;
  --badge-info-bg:       rgba(9, 105, 218, 0.1);
  --badge-info-text:     #0969da;

  /* Table */
  --table-header-bg:  #f0f3f7;
  --table-row-bg:     #ffffff;
  --table-row-hover:  #f3f6fb;
  --table-row-alt:    #fafbfc;

  /* Input */
  --input-bg:         #ffffff;
  --input-border:     #c8d3de;
  --input-text:       #1c2128;

  /* Modal / Card */
  --card-bg:          #ffffff;
  --card-border:      #d0d7de;
  --shadow-sm:        0 1px 3px rgba(0,0,0,0.08);
  --shadow-md:        0 4px 12px rgba(0,0,0,0.1);
  --shadow-lg:        0 10px 30px rgba(0,0,0,0.15);

  color-scheme: light;
}

/* ═══════════════════════════════════════════
   BASE RESET
═══════════════════════════════════════════ */
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
  background: var(--bg-page);
  color: var(--text-secondary);
  overflow: hidden;
  transition: background 0.25s ease, color 0.25s ease;
}

/* ═══════════════════════════════════════════
   LAYOUT
═══════════════════════════════════════════ */
#__nuxt {
  height: 100vh;
  display: flex;
  flex-direction: row;
  overflow: hidden;
}

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

/* ═══════════════════════════════════════════
   SCROLLBAR
═══════════════════════════════════════════ */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--bg-page); }
::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--text-tertiary); }

/* ═══════════════════════════════════════════
   COMMON COMPONENTS (global)
═══════════════════════════════════════════ */

/* Page titles */
.page-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
}

.page-sub {
  font-size: 13px;
  color: var(--text-tertiary);
  margin-top: 4px;
}

/* Cards */
.card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
}

/* Buttons */
button {
  cursor: pointer;
  font-family: inherit;
}

/* Inputs */
input, select, textarea {
  font-family: inherit;
  background: var(--input-bg);
  color: var(--input-text);
  border: 1px solid var(--input-border);
  border-radius: 8px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px var(--accent-subtle);
}

/* ─── Select arrow color fix for light mode ─── */
select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%238896a5' d='M1 1l5 5 5-5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  padding-right: 28px;
}

/* Tables */
table {
  border-collapse: collapse;
  width: 100%;
}

th {
  background: var(--table-header-bg);
  color: var(--text-tertiary);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 10px 14px;
  border-bottom: 1px solid var(--border-color);
  text-align: left;
}

td {
  padding: 10px 14px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-secondary);
  background: var(--table-row-bg);
  font-size: 13px;
}

tr:hover td {
  background: var(--table-row-hover);
}

/* ─── Severity badge system ─── */
.badge-critical { background: var(--badge-critical-bg); color: var(--badge-critical-text); }
.badge-error    { background: var(--badge-error-bg);    color: var(--badge-error-text); }
.badge-warning  { background: var(--badge-warning-bg);  color: var(--badge-warning-text); }
.badge-info     { background: var(--badge-info-bg);     color: var(--badge-info-text); }

/* ─── Overlay for modals ─── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
  z-index: 9000;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ─── Light mode force on common elements ─── */
:root.light body,
:root.light #__nuxt,
:root.light .app-shell,
:root.light .app-main,
:root.light .app-content {
  background: var(--bg-page);
  color: var(--text-secondary);
}
</style>
