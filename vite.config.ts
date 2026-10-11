/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// GitHub Pages serves this repo at /steampunk-shuffle/, so every asset
// reference needs that base path baked in at build time.
const pagesBase = "/steampunk-shuffle/";

// `vite build --mode native` is the Capacitor/iOS bundle (plan step 4.2): the
// app is served from the root of capacitor://localhost with every file already
// inside the binary, so it needs root-relative paths ("/", not "./": art URLs
// live in CSS custom properties, which resolve against the stylesheet in
// assets/) and no service worker.
export default defineConfig(({ mode }) => {
  const native = mode === "native";
  const base = native ? "/" : pagesBase;
  return {
    base,
    plugins: native ? [] : [pwa(base)],
    test: {
      environment: "jsdom",
      include: ["tests/unit/**/*.test.ts"],
    },
  };
});

function pwa(base: string) {
  return VitePWA({
    registerType: "autoUpdate",
    includeAssets: ["icons/*.png"],
    manifest: {
      id: base,
      name: "Steampunk Shuffle",
      short_name: "Wheatstone",
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
      // webp: the card-art assets in public/art/, required for offline
      // play (AUDIT-3.6.md P1). json: public/art/manifest.json, the only
      // JSON file under public/ — fetched at runtime to resolve artId ->
      // asset metadata (AUDIT-3.6.md P2). mp3: the optional ambience
      // track (plan step 3.4, sourced and wired same day as this
      // comment) — at ~4 MB it exceeds Workbox's default 2 MB
      // per-file precache cap, hence maximumFileSizeToCacheInBytes below.
      globPatterns: ["**/*.{js,css,html,png,svg,webmanifest,webp,json,mp3}"],
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
    },
    devOptions: {
      enabled: true,
    },
  });
}
