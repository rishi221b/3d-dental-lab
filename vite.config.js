import { defineConfig } from 'vite';

export default defineConfig({
  base: '/3d-dental-lab/',
  server: {
    port: 5173,
    open: false,
    host: true
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
});
