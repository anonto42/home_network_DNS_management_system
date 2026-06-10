/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// In Docker dev the backend container is reachable at http://backend:8080.
// Outside Docker (local npm run dev) it's at http://localhost:8080.
// Set VITE_API_HOST in the environment to override.
const apiHost = process.env.VITE_API_HOST ?? 'http://localhost:8080'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    port: 5173,
    host: '0.0.0.0',   // bind to all interfaces so the container port is reachable
    watch: {
      usePolling: true, // required for inotify inside Docker on Linux hosts
    },
    proxy: {
      '/api': {
        target: apiHost,
        changeOrigin: true,
      },
      '/health': {
        target: apiHost,
        changeOrigin: true,
      },
    },
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})
