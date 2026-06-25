import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Path aliases for clean imports
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@services': path.resolve(__dirname, './src/services'),
      '@data': path.resolve(__dirname, './src/data'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@types': path.resolve(__dirname, './src/types'),
      '@constants': path.resolve(__dirname, './src/constants'),
    },
  },

  // Development server configuration
  server: {
    port: 3001,
    host: true,
    open: true,
    hmr: {
      overlay: true,
    },
  },

  // Build optimizations
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['lucide-react', 'marked'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },

  // Optimizations
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react', 'marked'],
  },

  // Preview server configuration
  preview: {
    port: 4173,
    host: true,
  },

  test: {
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: ['**/node_modules/**', '**/.claude/**', '**/old-wf-studio-fe-main/**', '**/docs/**', '**/dist/**'],
  },
})
