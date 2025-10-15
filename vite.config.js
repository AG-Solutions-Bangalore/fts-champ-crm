import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'



export default defineConfig({
  plugins: [
    react({

      fastRefresh: true,

      babel: {
        plugins: [
        
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


  build: {

    target: 'esnext',
    

    minify: 'terser',
    
    terserOptions: {
      compress: {
        drop_console: true, 
        drop_debugger: true, 
        pure_funcs: ['console.log'],
      },
    },
    
  
    rollupOptions: {
      output: {
        manualChunks: {
      
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

        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    

    chunkSizeWarningLimit: 1000,
    
  
    sourcemap: false,
    
   
    cssCodeSplit: true,
  },


  server: {
    port: 3000,
    strictPort: false,
    hmr: {
      overlay: true, 
    },
  
    cors: true,
  },


  preview: {
    port: 4173,
    strictPort: false,
  },


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


  esbuild: {

    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
})