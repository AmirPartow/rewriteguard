import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    proxy: {
      '/v1': {
        target: 'http://52.32.253.222',
        changeOrigin: true,
        secure: false,
      },
      '/health': {
        target: 'http://52.32.253.222',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
