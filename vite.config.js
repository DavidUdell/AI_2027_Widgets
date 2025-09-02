import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry: 'src/index.js',
      name: 'AI2027Widgets',
      formats: ['es', 'iife'],
      fileName: (format) => `ai-2027-widgets.${format}.js`,
    },
    sourcemap: true,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
