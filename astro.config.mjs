import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://bananajunk.dev",
  output: "static",
  devToolbar: { enabled: false },
  trailingSlash: "never",
  build: {
    // Never inline CSS so the CSP can stay free of 'unsafe-inline'.
    inlineStylesheets: "never",
  },
  vite: {
    build: {
      // Keep page scripts as files so the CSP can stay free of inline script.
      assetsInlineLimit: 0,
    },
    plugins: [tailwindcss()],
  },
});
