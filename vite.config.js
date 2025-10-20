import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Vite config cho Electron + Vue 3
export default defineConfig({
  base: './', // base tuyệt đối cho web browser
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: ['exceljs', 'sqlite3', 'better-sqlite3', 'puppeteer', 'upath']
    }
  },
  server: {
    hmr: { 
      overlay: false,
      port: 5173
    },
    port: 5173,
    host: 'localhost',
    cors: true,
    strictPort: false,
    silent: true
  },
  optimizeDeps: {
    exclude: ['better-sqlite3', 'exceljs', 'puppeteer']
  },
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false
  }
})
