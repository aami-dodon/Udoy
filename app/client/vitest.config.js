import { mergeConfig } from 'vite';
import { defineConfig } from 'vitest/config';
import baseConfig from './vite.config.js';

export default mergeConfig(
  baseConfig({ mode: 'test' }),
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './vitest.setup.js',
      restoreMocks: true,
    },
  })
);
