import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';
import favicons from 'astro-favicons';
import { defineConfig, sessionDrivers } from 'astro/config';

export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    imageService: 'passthrough',
  }),
  // Keep metadata in Favicon.astro; installable-app assets can be enabled here later.
  integrations: [
    favicons({
      input: 'public/favicon.svg',
      background: '#fff',
      icons: {
        android: false,
        appleIcon: ['apple-touch-icon.png'],
        appleStartup: false,
        favicons: ['favicon.ico'],
        windows: false,
        yandex: false,
      },
      output: {
        html: false,
      },
      withCapo: false,
    }),
  ],
  session: {
    driver: sessionDrivers.cloudflareKVBinding({
      binding: 'SESSION',
    }),
  },
  security: {
    checkOrigin: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
