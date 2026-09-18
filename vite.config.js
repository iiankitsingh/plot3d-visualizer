import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Ensures assets load correctly on GitHub Pages under any subpath
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1500,
  }
})
