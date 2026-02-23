import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    proxy: {
      '/v1': {
        target: 'https://www.rewriteguard.com',
        changeOrigin: true,
        secure: true,
      },
      '/health': {
        target: 'https://www.rewriteguard.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
