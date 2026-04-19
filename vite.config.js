import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import sitemap from 'vite-plugin-sitemap';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? process.env.BASE_PATH || '/Portfolio/' : '/',
  plugins: [
    checker(),
    sitemap({
      hostname: 'https://sergiosuarezgil.com',
    }),
  ],
  server: {
    open: '/index.html',
  },
  css: {
    devSourcemap: true,
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
  },
}));
