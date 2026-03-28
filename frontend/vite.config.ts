import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/leaders': 'http://localhost:8000',
      '/profile': 'http://localhost:8000',
      '/compatibility': 'http://localhost:8000',
      '/scenarios': 'http://localhost:8000',
      '/analyze': 'http://localhost:8000',
      '/health': 'http://localhost:8000',
    },
  },
})
