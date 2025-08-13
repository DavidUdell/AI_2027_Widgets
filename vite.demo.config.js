import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        demo: resolve(__dirname, 'index.html')
      }
    },
    // Ensure assets are properly hashed for caching
    assetsDir: 'assets',
    // Generate manifest for asset tracking
    manifest: true
  },
  root: '.',
  publicDir: 'public',
  // Ensure proper base path for deployment
  base: './'
});
