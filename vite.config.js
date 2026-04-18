import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import sitemap from 'vite-plugin-sitemap';

export default defineConfig({
  plugins: [
    checker(),
    sitemap({
      hostname: 'https://sergiosuarezgil.com',
    })
  ],
  server: {
    open: '/index.html',
  },
});
