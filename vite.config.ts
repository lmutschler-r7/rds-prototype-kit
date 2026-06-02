import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@lib': fileURLToPath(new URL('./lib', import.meta.url)),
      '@app': fileURLToPath(new URL('./app', import.meta.url))
    }
  },
  server: {
    port: 5173,
    strictPort: true
  }
});