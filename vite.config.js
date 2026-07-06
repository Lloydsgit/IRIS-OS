
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'error',
  plugins: [
    react(),
  ],
  // Vercel deployment settings
  server: {
    host: true,
    port: 3000,
  },
  // Ensure proper build output for Vercel
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  // Handle client-side routing
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})