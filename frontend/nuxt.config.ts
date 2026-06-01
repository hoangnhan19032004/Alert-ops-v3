// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxt/icon',
    '@nuxtjs/i18n'
  ],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'AlertOps — FPT Telecom',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap' }
      ],
      style: [
        {
          innerHTML: `
            html, body {
              font-family: var(--font-family, 'Inter', sans-serif);
              font-size: var(--font-size-base, 14px);
            }
            * { font-family: inherit; }
          `
        }
      ]
    },
  },

  vite: {
    optimizeDeps: {
      include: [
        'chart.js/auto',
        '@microsoft/signalr',
        '@vue/devtools-core',
        '@vue/devtools-kit',
        'dayjs',
        'dayjs/plugin/timezone',
        'dayjs/plugin/utc',
      ]
    }
  },

  compatibilityDate: '2024-04-03',

  runtimeConfig: {
    apiBase: 'http://localhost:5000',
    public: {
      apiBase: 'http://localhost:5000'
    }
  },

  i18n: {
    locales: ['en', 'vi'],
    defaultLocale: 'en'
  }
})