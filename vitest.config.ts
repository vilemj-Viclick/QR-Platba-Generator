import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Enable TypeScript support
    include: ['**/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    // Environment setup
    environment: 'node',
    // Coverage reporting
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
});