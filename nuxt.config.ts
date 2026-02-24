import { defineNuxtConfig } from 'nuxt/config';

const PRODUCTION_DOMAIN = 'https://blocklogic.netlify.app';

export default defineNuxtConfig({
  compatibilityDate: '2026-02-24',
  vite: {
    server: {
      allowedHosts: [
        'devserver-main--superb-pony-7bb699.netlify.app',
        'blocklogic.netlify.app'
      ]
    }
  },
  experimental: {
    appManifest: false
  },
  modules: ['@vite-pwa/nuxt'],
  typescript: {
    typeCheck: true,
  },
  app: {
    head: {
      title: 'BlockLogic - Blockudoku Game',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#1a1a2e', id: 'theme-color-meta' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent', id: 'apple-status-bar' },
        { name: 'apple-mobile-web-app-title', content: 'BlockLogic' },
        {
          name: 'description',
          content: 'A captivating puzzle game combining Sudoku grids with Tetris-style block placement mechanics'
        }
      ],
      link: [
        { rel: 'canonical', href: PRODUCTION_DOMAIN },
        { rel: 'stylesheet', href: '/css/styles.css' },
        { rel: 'icon', type: 'image/png', href: '/img/icon-192.png' },
        { rel: 'apple-touch-icon', href: '/img/icon-192.png' }
      ],
      script: [
        { src: '/js/Grid.js' },
        { src: '/js/Pieces.js' },
        { src: '/js/ScoreManager.js' },
        { src: '/js/ScoreBackupManager.js' },
        { src: '/js/Renderer.js' },
        { src: '/js/InputHandler.js' },
        { src: '/js/Game.js' },
        { src: '/js/main.js' }
      ]
    }
  },
  runtimeConfig: {
    neonDatabaseUrl: process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL || '',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || PRODUCTION_DOMAIN
    }
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'BlockLogic - Blockudoku Game',
      short_name: 'BlockLogic',
      description: 'A captivating puzzle game combining Sudoku grids with Tetris-style block placement mechanics',
      theme_color: '#1a1a2e',
      background_color: '#1a1a2e',
      display: 'standalone',
      orientation: 'portrait',
      start_url: '/',
      scope: '/',
      icons: [
        { src: '/img/icon-72.png', sizes: '72x72', type: 'image/png' },
        { src: '/img/icon-96.png', sizes: '96x96', type: 'image/png' },
        { src: '/img/icon-128.png', sizes: '128x128', type: 'image/png' },
        { src: '/img/icon-144.png', sizes: '144x144', type: 'image/png' },
        { src: '/img/icon-152.png', sizes: '152x152', type: 'image/png' },
        { src: '/img/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/img/icon-384.png', sizes: '384x384', type: 'image/png' },
        { src: '/img/icon-512.png', sizes: '512x512', type: 'image/png' }
      ]
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico,json}'],
      navigateFallback: '/',
      runtimeCaching: [
        {
          urlPattern: '/api/leaderboard',
          handler: 'NetworkFirst',
          options: {
            cacheName: 'leaderboard-api-cache',
            expiration: {
              maxEntries: 20,
              maxAgeSeconds: 60 * 60
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        }
      ]
    }
  }
});
