import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@pegbox/tool-kit': path.resolve(__dirname, 'packages/tool-kit/src/index.ts'),
      '@pegbox/media': path.resolve(__dirname, 'packages/media/src/index.ts'),
      'tools': path.resolve(__dirname, 'tools'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
  },
});

