import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Expose server on all network interfaces for containerized environments
    hmr: process.env.CF_PAGES
      ? {
          host: process.env.CF_PAGES_URL?.split('//')[1], // Use the public URL for the HMR client
          protocol: 'wss', // Use secure websockets
          clientPort: 443, // Standard port for HTTPS/WSS
        }
      : undefined,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});