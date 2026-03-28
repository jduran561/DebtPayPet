import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Target modern browsers for smaller output
    target: 'es2020',
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Use esbuild for fast minification (built-in)
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // Split vendor chunks for better caching
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'state': ['zustand'],
        },
      },
    },
    // Disable source maps in production
    sourcemap: false,
  },
  esbuild: {
    // Drop console.log and debugger in production
    drop: ['console', 'debugger'],
  },
})
