import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import devtoolsJson from 'vite-plugin-devtools-json';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    devtoolsJson(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        theme_color: '#ed7560',
        orientation: 'portrait',
        display: 'fullscreen',
        icons: [
          {
            src: 'android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          { src: 'icons/digit-1-black.png', sizes: '72x72', type: 'image/png' },
          { src: 'icons/digit-1-white.png', sizes: '72x72', type: 'image/png' },
          { src: 'icons/digit-2-black.png', sizes: '72x72', type: 'image/png' },
          { src: 'icons/digit-2-white.png', sizes: '72x72', type: 'image/png' },
          { src: 'icons/digit-3-black.png', sizes: '72x72', type: 'image/png' },
          { src: 'icons/digit-3-white.png', sizes: '72x72', type: 'image/png' },
          { src: 'icons/digit-4-black.png', sizes: '72x72', type: 'image/png' },
          { src: 'icons/digit-4-white.png', sizes: '72x72', type: 'image/png' },
          { src: 'icons/digit-5-black.png', sizes: '72x72', type: 'image/png' },
          { src: 'icons/digit-5-white.png', sizes: '72x72', type: 'image/png' },
          { src: 'icons/digit-6-black.png', sizes: '72x72', type: 'image/png' },
          { src: 'icons/digit-6-white.png', sizes: '72x72', type: 'image/png' },
          { src: 'icons/piece-black-2-sh.png', sizes: '72x72', type: 'image/png' },
          { src: 'icons/piece-black-2.png', sizes: '72x72', type: 'image/png' },
          { src: 'icons/piece-black.png', sizes: '72x72', type: 'image/png' },
          { src: 'icons/piece-white-2-sh.png', sizes: '72x72', type: 'image/png' },
          { src: 'icons/piece-white-2.png', sizes: '72x72', type: 'image/png' },
          { src: 'icons/piece-white.png', sizes: '72x72', type: 'image/png' }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      input: {
        // 404 page for github pages will be same as index.html
        '404': 'index.html'
      }
    }
  }
  // base: '/PeaceInTheMiddleEast/'
})
