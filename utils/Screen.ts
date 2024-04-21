import { Capacitor } from "@capacitor/core";
import { StatusBar } from "@capacitor/status-bar";
import { NavigationBar } from "@hugotomazi/capacitor-navigation-bar";
import { ScreenOrientation } from "@capacitor/screen-orientation";
import "@hugotomazi/capacitor-navigation-bar";

export default {
  fullscreen: {
    async exit() {
      if (Capacitor.getPlatform() === "web") {
        if (document.fullscreenElement) document.exitFullscreen();
      } else {
        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.show();
        await NavigationBar.show();
      }

      Theme.update();
    },

    async request() {
      if (Capacitor.getPlatform() === "web") {
        if (!document.fullscreenElement) document.body.requestFullscreen();
      } else {
        await StatusBar.setOverlaysWebView({ overlay: true });
        await StatusBar.hide();
        await NavigationBar.hide();
      }

      Theme.update();
    },
  },

  async orientation(orientation: "landscape" | "portrait") {
    if (Capacitor.getPlatform() !== "web") {
      await ScreenOrientation.lock({ orientation });
      Theme.update();
    }
  },
};
