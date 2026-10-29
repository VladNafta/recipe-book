import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    // запити /api перенаправляються на сервер Express
    proxy: { '/api': 'http://localhost:4000' },
  },
})
