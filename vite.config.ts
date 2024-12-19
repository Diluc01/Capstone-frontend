import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Ignore size reporting and force build
    reportCompressedSize: false,
    sourcemap: false, // Optional: avoids sourcemap warnings
  },
  esbuild: {
    // Suppress warnings and errors during the build
    logLevel: 'silent',
  },
})
