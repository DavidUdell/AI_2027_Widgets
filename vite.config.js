import { defineConfig } from 'vite';

export default defineConfig({
  // Demo build
    // build: {
    //   outDir: 'dist',
    //   emptyOutDir: true,
    //   assetsDir: 'assets',
    // },
    // root: '.',
    // publicDir: 'public',
    // base: './',

// Library build
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
