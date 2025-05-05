import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'demo',
  publicDir: 'public',
  server: {
    port: 3000,
    open: true,
    watch: {
      // Наблюдаем за изменениями в библиотеке тоже
      extraPaths: ['../src/**/*.ts', '../src/**/*.js'],
    },
  },
  build: {
    outDir: '../demo-dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src'),
    },
  },
  define: {
    'process.env.npm_package_version': JSON.stringify(process.env.npm_package_version),
  },
});
