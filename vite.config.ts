import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/claude/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/admin': {
        target: 'http://localhost:1337',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:1337',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:1337',
        changeOrigin: true,
      },
      '/i18n': {
        target: 'http://localhost:1337',
        changeOrigin: true,
      },
      '/content-manager': {
        target: 'http://localhost:1337',
        changeOrigin: true,
      },
      '/content-type-builder': {
        target: 'http://localhost:1337',
        changeOrigin: true,
      },
      '/users-permissions': {
        target: 'http://localhost:1337',
        changeOrigin: true,
      },
      '/upload': {
        target: 'http://localhost:1337',
        changeOrigin: true,
      },
    },
  },
})
