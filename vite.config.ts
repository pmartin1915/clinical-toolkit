import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173
  },
  resolve: {
    alias: {
      // Ensure proper resolution of dependencies from shared library
      '@radix-ui/react-slot': path.resolve(__dirname, 'node_modules/@radix-ui/react-slot'),
      '@radix-ui/react-dialog': path.resolve(__dirname, 'node_modules/@radix-ui/react-dialog'),
      'class-variance-authority': path.resolve(__dirname, 'node_modules/class-variance-authority'),
      'lucide-react': path.resolve(__dirname, 'node_modules/lucide-react'),
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Clinical Toolkit',
        short_name: 'Clinical Toolkit',
        description: 'Evidence-based clinical reference and toolkit for healthcare professionals',
        theme_color: '#0ea5e9',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom'],
          'vendor-ui': ['lucide-react', '@headlessui/react'],
          'vendor-charts': ['chart.js', 'react-chartjs-2'],
          'vendor-utils': ['date-fns', 'zustand'],
          'vendor-export': ['html2canvas', 'jspdf', 'jszip', 'papaparse'],
          
          // Application chunks
          'tools': [
            './src/components/tools/A1CConverter',
            './src/components/tools/ASCVDCalculator',
            './src/components/tools/GAD7Assessment',
            './src/components/tools/PHQ9Assessment',
            './src/components/tools/BPTracker'
          ],
          'conditions': [
            './src/data/conditions/hypertension',
            './src/data/conditions/diabetes',
            './src/data/conditions/anxiety',
            './src/data/conditions/depression'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 600
  }
})
