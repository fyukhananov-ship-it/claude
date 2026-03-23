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
      // Strapi admin panel (served at /claude/admin)
      '/claude/admin': {
        target: 'http://localhost:1337',
        changeOrigin: true,
      },
      // Strapi REST API
      '/claude/api': {
        target: 'http://localhost:1337',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/claude/, ''),
      },
      // Strapi uploads (images)
      '/claude/uploads': {
        target: 'http://localhost:1337',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/claude/, ''),
      },
      // Strapi internal routes used by admin panel
      '/claude/content-manager': {
        target: 'http://localhost:1337',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/claude/, ''),
      },
      '/claude/content-type-builder': {
        target: 'http://localhost:1337',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/claude/, ''),
      },
      '/claude/users-permissions': {
        target: 'http://localhost:1337',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/claude/, ''),
      },
      '/claude/upload': {
        target: 'http://localhost:1337',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/claude/, ''),
      },
      '/claude/i18n': {
        target: 'http://localhost:1337',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/claude/, ''),
      },
    },
  },
})
