import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      // The entry point for the library
      entry: resolve(__dirname, 'src/index.ts'),
      // The name of the library
      name: 'QRPlatbaGenerator',
      // The output formats
      formats: ['es', 'cjs'],
      // The file name pattern for the output files
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    // Ensure external dependencies are not bundled
    rollupOptions: {
      external: ['qrcode'],
      output: {
        // Provide global variables for external dependencies
        globals: {
          qrcode: 'QRCode',
        },
      },
    },
  },
  // Ensure TypeScript is properly handled
  resolve: {
    extensions: ['.ts', '.js'],
  },
});