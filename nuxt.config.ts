// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  // 1. Khai báo các Module cần thiết
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxt/icon',
    '@nuxtjs/i18n'
  ],

  // 2. Cấu hình CSS chính
  css: ['~/assets/css/main.css'],

  // 3. Cấu hình Header và Font chữ
  app: {
    head: {
      title: 'AlertOps — FPT Telecom',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        // Thêm Font DM Sans để giao diện đẹp như bản mẫu
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap' }
      ]
    },
  },

  // 4. Sửa lỗi tối ưu hóa cho Chart.js (nếu bạn có dùng trang Analytics)
  vite: {
    optimizeDeps: {
      include: ['chart.js/auto']
    }
  },

  compatibilityDate: '2024-04-03',

  // Runtime config - API base URL
  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:5000'
    }
  },

  // i18n config
  i18n: {
    locales: ['en', 'vi'],
    defaultLocale: 'en'
  }
})