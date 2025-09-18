import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'remove-console-in-production',
      apply: 'build',
      transform(code, id) {
        if (id.includes('node_modules')) return;
        
        // Remove console.log, console.debug, console.info, console.warn in production
        // Keep console.error for actual errors
        return code.replace(
          /console\.(log|debug|info|warn)\s*\([^)]*\);?/g,
          ''
        );
      }
    }
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom']
        }
      }
    }
  }
})
