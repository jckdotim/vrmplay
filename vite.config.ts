import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    hmr: {
      overlay: true,
      protocol: 'ws',
      host: 'localhost',
      port: 24678,
      clientPort: 24678,
    },
    watch: {
      usePolling: true,
      interval: 100,
    },
  },
})
