import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://bananajunk.dev",
  output: "static",
  trailingSlash: "never",
  build: {
    // Never inline CSS so the CSP can stay free of 'unsafe-inline'.
    inlineStylesheets: "never",
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
