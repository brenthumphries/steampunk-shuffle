/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// GitHub Pages serves this repo at /steampunk-shuffle/, so every asset
// reference needs that base path baked in at build time.
const base = "/steampunk-shuffle/";

export default defineConfig({
  base,
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/*.png"],
      manifest: {
        id: base,
        name: "Steampunk Shuffle",
        short_name: "Shuffle",
        description: "A steampunk deck-building card game set in The Wheatstone Bridge.",
        start_url: base,
        scope: base,
        display: "standalone",
        orientation: "portrait",
        background_color: "#1a120b",
        theme_color: "#1a120b",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // webp: the 93 card-art assets in public/art/, required for offline
        // play (AUDIT-3.6.md P1). json: public/art/manifest.json, the only
        // JSON file under public/ — fetched at runtime to resolve artId ->
        // asset metadata (AUDIT-3.6.md P2).
        globPatterns: ["**/*.{js,css,html,png,svg,webmanifest,webp,json}"],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  test: {
    environment: "jsdom",
    include: ["tests/unit/**/*.test.ts"],
  },
});
