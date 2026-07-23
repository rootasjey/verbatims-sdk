export default defineNuxtConfig({
  compatibilityDate: '2025-12-31',
  devtools: { enabled: false },
  devServer: { port: 3006 },

  modules: [
    '@una-ui/nuxt',
    '@unocss/nuxt',
    '@nuxtjs/google-fonts',
  ],

  googleFonts: {
    families: {
      'DM+Sans': [400, 500, 600, 700],
      Fraunces: {
        wght: [400, 600, 700],
        ital: [400, 600],
      },
    },
    display: 'swap',
    preconnect: true,
    download: true,
    base64: false,
  },

  una: {
    prefix: 'N',
    themeable: true,
  },

  unocss: {
    preflight: true,
    theme: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Fraunces', 'DM Sans', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#6366f1',
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        surface: 'var(--c-surface)',
        muted: 'var(--c-muted)',
        border: 'var(--c-border)',
      },
    },
  },

  app: {
    head: {
      title: '@verbatims/sdk - TypeScript SDK for the Verbatims quotes API',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'TypeScript SDK for the Verbatims quotes API. Browse, search, and manage quotes, authors, references, and collections.' },
        { property: 'og:title', content: '@verbatims/sdk - Verbatims API SDK' },
        { property: 'og:description', content: 'TypeScript SDK for the Verbatims quotes API.' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      script: [
        {
          innerHTML: `(function(){try{var p=localStorage.getItem('verbatims-theme')||'dark';var t=p==='system'?(window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'):p;document.documentElement.setAttribute('data-theme',t);document.documentElement.setAttribute('data-theme-preference',p);document.cookie='verbatims-theme='+p+';path=/;SameSite=Lax'}catch(e){}})()`,
        },
      ],
    },
  },

  nitro: {
    preset: 'cloudflare-module',
  },
})
