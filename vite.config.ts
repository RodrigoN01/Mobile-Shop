import { defineConfig } from "vite";
import type { Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const API_ORIGIN = "https://itx-frontend-test.onrender.com";

// Content-Security-Policy for the production build. Only applied on `build`
// because Vite's dev server relies on inline scripts for HMR. If you deploy
// behind a server/CDN, prefer sending this as an HTTP header (meta CSP can't
// express frame-ancestors) along with X-Content-Type-Options: nosniff.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' https://fonts.googleapis.com",
  "font-src https://fonts.gstatic.com",
  `img-src 'self' data: ${API_ORIGIN}`,
  `connect-src ${API_ORIGIN}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = (): Plugin => ({
  name: "security-meta-tags",
  apply: "build",
  transformIndexHtml: () => [
    {
      tag: "meta",
      attrs: { "http-equiv": "Content-Security-Policy", content: CSP },
      injectTo: "head-prepend",
    },
    {
      tag: "meta",
      attrs: { name: "referrer", content: "strict-origin-when-cross-origin" },
      injectTo: "head-prepend",
    },
  ],
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        // React Compiler: automatic memoization of components and hooks.
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
    securityHeaders(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Prepend this to every scss file so variables/mixins are available globally
        additionalData: `@use "@/styles/variables.scss" as *;`,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Long-term cacheable vendor chunk: app deploys don't bust React's cache.
        manualChunks(id) {
          if (/node_modules\/(react|react-dom|react-router|scheduler)\//.test(id)) {
            return "vendor";
          }
        },
      },
    },
  },
});
