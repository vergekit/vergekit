import { fileURLToPath, URL } from 'node:url';
import { getViteConfig } from 'astro/config';
import { defineConfig, mergeConfig } from 'vitest/config';

const root = fileURLToPath(new URL('.', import.meta.url));

const astroViteConfig = getViteConfig(
  {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    ssr: {
      noExternal: ['@backstro/email'],
    },
  },
  {
    output: 'server',
    root,
    configFile: false,
  },
);

export default defineConfig(async (env) =>
  mergeConfig(await astroViteConfig(env), {
    test: {
      environment: 'node',
      include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
      passWithNoTests: true,
    },
  }),
);
