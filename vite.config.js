import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/pracd/',
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API calls during dev: frontend http://localhost:5173 -> backend http://localhost:5000
      // Adjust the target port/host to match your backend server
      '/auth': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        // keep /auth prefix as-is when forwarding
        // if your backend mounts the router at /auth, this is fine.
        // If it mounts at /api/auth, use rewrite instead:
        // rewrite: (path) => path.replace(/^\/auth/, '/api/auth'),
      },
    },
  },
})
