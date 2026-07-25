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
          DEFAULT: '#6266F1',
          50: '#EEEEFD',
          100: '#DDDEFA',
          200: '#BBBDF6',
          300: '#999CF1',
          400: '#787BEC',
          500: '#6266F1',
          600: '#4E51C9',
          700: '#3B3DA1',
          800: '#282A79',
          900: '#191A4D',
        },
        accent: {
          DEFAULT: '#FAA533',
          50: '#FFF3E0',
          100: '#FFE8B2',
          200: '#FFD580',
          300: '#FAB95B',
          400: '#FAA533',
          500: '#FAA533',
          600: '#E8912A',
          700: '#CC7A1F',
          800: '#AD6416',
          900: '#8C4E0E',
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
      link: [
        { rel: 'icon', href: '/images/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/images/icon-192.png' },
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
    compatibilityDate: '2025-12-31',
  },
})
