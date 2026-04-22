import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      proxy: {
        '/api/v1': {
          target: (env.VITE_API_BASE_URL || 'http://127.0.0.1:8080').replace(/\/$/, ''),
          changeOrigin: true,
          secure: false,
        },
        '/api/forgot-password': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        },
        '/api/reset-password': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        }
      }
    }
  }
})
