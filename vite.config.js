import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.js",
      name: "AI_2027_Widgets",
      fileName: (format) => `ai-2027-widgets.${format}.js`,
    },
  },
  // Serve demo.html as the main page during development
  root: ".",
  publicDir: "public",
});
