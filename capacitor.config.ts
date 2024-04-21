import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.domutala.drivers",
  appName: "Drivers",
  webDir: ".output/public",
  server: {
    androidScheme: "https",
  },
};

export default config;
