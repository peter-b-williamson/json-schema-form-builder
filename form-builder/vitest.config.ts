import { fileURLToPath } from 'node:url';
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      setupFiles: ['./src/test-setup.ts'],
      server: {
        deps: {
          // Vitest externalises node_modules by default, which hands Vuetify's
          // per-component CSS side-effect imports to Node's raw ESM loader
          // instead of Vite's, and Node can't parse .css files.
          inline: ['vuetify'],
        },
      },
    },
  }),
);
