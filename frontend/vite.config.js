import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg"],
      manifest: {
        name: "FRAME.",
        short_name: "FRAME.",
        description: "Paste a link. Pull the frame. No ads, ever.",
        theme_color: "#171310",
        background_color: "#171310",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" },
        ],
      },
    }),
  ],
  build: {
    minify: false,
  },
  server: {
    proxy: {
      "/api": {
        target: "https://frame-backend.railway.app",
        changeOrigin: true,
      },
    },
  },
});