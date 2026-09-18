import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    testTimeout: 10000,
    fileParallelism: false, // Ensure DB tests run sequentially to avoid collisions if they use same data
  },
});
