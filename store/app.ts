import { Capacitor } from "@capacitor/core";
import { StatusBar } from "@capacitor/status-bar";
import { defineStore } from "pinia";
import { ref } from "vue";

const useAppStore = defineStore(
  "app",
  () => {
    const mode = ref<"traveller" | "driver">("traveller");
    function setMode(value: "traveller" | "driver") {
      mode.value = value;
    }

    const theme = ref<"dark" | "light" | null>(null);
    const usedTheme = ref<"dark" | "light">("dark");
    function setTheme(value: "dark" | "light" | null) {
      theme.value = value;

      let _theme = theme.value;

      if (_theme === null) {
        if (
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches
        ) {
          _theme = "dark";
        } else _theme = "light";
      }

      setTimeout(() => {
        usedTheme.value = _theme;
        dispatchEvent(new CustomEvent("theme:change", { detail: _theme }));
      }, 100);
    }

    const statusBar = ref<{ height: number }>({ height: 0 });
    function setStatusBar(value: { height: number }) {
      statusBar.value = value;
    }

    async function init() {
      if (Capacitor.getPlatform() !== "web") {
        const infos = await StatusBar.getInfo();
        Store.app.setStatusBar({ height: (infos as any).height });
        // await ScreenOrientation.lock({ orientation: "portrait" });
      }

      // const response = await fetch("https://ipinfo.io/json");
      // const data = await response.json();
      // country.value = (data.country as string).toUpperCase();
    }

    return {
      theme,
      setTheme,
      usedTheme,

      statusBar,
      setStatusBar,

      mode,
      setMode,

      init,
    };
  },
  { persist: true }
);

export default useAppStore;
