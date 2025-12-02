import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Porta do Frontend (confirme se é essa)
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001', // <--- USE ASSIM (IP direto), não use 'localhost'
        changeOrigin: true,
        secure: false,
      },
    },
  },
})