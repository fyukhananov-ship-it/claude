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
      '/strapi': {
        target: 'http://localhost:1337',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/strapi/, ''),
      },
    },
  },
})
