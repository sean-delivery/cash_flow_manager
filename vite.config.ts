import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const isCodespaces = !!process.env.CODESPACE_NAME;
const codespaceHost = isCodespaces
  ? `${process.env.CODESPACE_NAME}-5173.app.github.dev`
  : 'localhost';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,          // bind 0.0.0.0
    port: 5173,
    strictPort: true,
    cors: true,
    hmr: {
      host: isCodespaces ? codespaceHost : 'localhost',
      clientPort: isCodespaces ? 443 : 5173,
      protocol: isCodespaces ? 'wss' : 'ws'
    }
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react'],
          i18n: ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          supabase: ['@supabase/supabase-js'],
          utils: ['axios']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    exclude: ['lucide-react']
  }
});
