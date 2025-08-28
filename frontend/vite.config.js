import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000', // For testing with user's API key
      '/transcribe': 'http://localhost:5000',
    },
  },
})