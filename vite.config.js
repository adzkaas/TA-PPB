import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      outDir: 'dist',
      filename: 'sw.js',
      manifest: {
        name: 'AquascapeHub',
        short_name: 'AquascapeHub',
        description: 'Katalog Tanaman Air & Biota Akuarium Hias',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#0c2f27',
        theme_color: '#0c2f27',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        inlineWorkboxRuntime: false,
      },
    }),
  ],
})
