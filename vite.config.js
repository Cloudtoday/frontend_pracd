import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // ✅ Load env variables based on mode (development / production)
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: './', // ✅ works on Netlify
    plugins: [react()],
    server: {
      proxy: {
        '/auth': {
          // ✅ Now use env safely
          target: env.VITE_API_URL || 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
  }
})
