// tailwind.config.js
export default {
  // Tắt preflight để Tailwind không reset CSS của mình
  corePlugins: {
    preflight: false,
  },
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'brand-navy': '#0b1120',
        'brand-dark': '#020617',
        'critical': '#ef4444',
        'warning': '#f59e0b',
        'info': '#3b82f6',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
}
