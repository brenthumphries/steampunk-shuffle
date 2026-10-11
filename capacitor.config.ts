import type { CapacitorConfig } from "@capacitor/cli";

// appId is the App Store Connect bundle id (plan step 4.3); changing it after
// the app record exists means creating a new record.
const config: CapacitorConfig = {
  appId: "com.brenthumphries.steampunkshuffle",
  appName: "Steampunk Shuffle",
  webDir: "dist",
  backgroundColor: "#1a120b",
  ios: {
    contentInset: "never",
    scrollEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 1200,
      backgroundColor: "#11141b",
    },
  },
};

export default config;
