import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Configuración del manifiesto de la PWA
      manifest: {
        name: 'CleanMart POS',
        short_name: 'CleanMart',
        description: 'Punto de venta de productos de limpieza CleanMart',
        theme_color: '#3B82F6', // Azul de Tailwind
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable' // Ícono que se adapta a formas (círculo, cuadrado, etc.)
          }
        ]
      }
    })
  ],
})