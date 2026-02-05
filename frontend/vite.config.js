import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,      // CRITICAL: Allows Docker to expose the server to your machine
    port: 5173,      // The standard Vite port
    proxy: {
      '/api': {
        // "backend" refers to the service name in docker-compose.yml
        // Docker automatically resolves this name to the correct internal IP.
        target: 'http://backend:5001', 
        changeOrigin: true,
        secure: false,
      }
    }
  }
})