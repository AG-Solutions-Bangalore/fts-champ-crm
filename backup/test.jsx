import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable Fast Refresh
      fastRefresh: true,
      // Babel configuration for production optimizations
      babel: {
        plugins: [
          // Remove console logs in production
          process.env.NODE_ENV === 'production' && [
            'transform-remove-console',
            { exclude: ['error', 'warn'] }
          ]
        ].filter(Boolean)
      }
    })
  ],
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // Build optimizations
  build: {
    // Target modern browsers for smaller bundles
    target: 'esnext',
    
    // Enable minification
    minify: 'terser',
    
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs
        drop_debugger: true, // Remove debugger statements
        pure_funcs: ['console.log'], // Remove specific console methods
      },
    },
    
    // Chunk splitting strategy
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-popover',
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-label',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tooltip'
          ],
          'form-vendor': ['react-hook-form', '@hookform/resolvers'],
          'table-vendor': ['@tanstack/react-table'],
          'query-vendor': ['@tanstack/react-query'],
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
          'utils': ['axios', 'clsx', 'tailwind-merge', 'class-variance-authority'],
        },
        // Consistent naming for cache busting
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    
    // Source maps for production debugging (disable for smaller builds)
    sourcemap: false,
    
    // CSS code splitting
    cssCodeSplit: true,
  },

  // Development server optimization
  server: {
    port: 3000,
    strictPort: false,
    hmr: {
      overlay: true, // Show errors in overlay
    },
    // Enable CORS if needed
    cors: true,
  },

  // Preview server configuration
  preview: {
    port: 4173,
    strictPort: false,
  },

  // Dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@tanstack/react-table',
      'axios',
      'lucide-react',
    ],
    exclude: ['@radix-ui/react-icons'],
  },

  // Performance optimizations
  esbuild: {
    // Remove console and debugger in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
})