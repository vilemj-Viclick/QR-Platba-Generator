import {defineConfig} from 'vite';
import {resolve} from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [],
  root: '.', // Set the root directory to the current directory
  publicDir: 'public', // Public assets directory
  build: {
    outDir: '../dist/app/', // Output directory for the build
    emptyOutDir: true, // Empty the output directory before building
    sourcemap: true, // Enable source maps in production
  },
  server: {
    port: 3000, // Default port for development server
    proxy: {
      // Proxy API requests to the backend server
      '/qr-platba': {
        target: 'http://localhost:4000', // Assuming the backend runs on port 4000
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      // Add any path aliases if needed
      '@': resolve(__dirname, 'src'),
    },
  },
});