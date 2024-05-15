import type { CapacitorConfig } from "@capacitor/cli";
import { KeyboardResize, KeyboardStyle } from "@capacitor/keyboard";

const config: CapacitorConfig = {
  appId: "com.domutala.drivers",
  appName: "Drivers",
  webDir: ".output/public",
  server: {
    androidScheme: "https",
  },
  plugins: {
    Keyboard: {
      resize: KeyboardResize.Body,
      // style: KeyboardStyle.Dark,
      resizeOnFullScreen: true,
    },
  },
};

export default config;
