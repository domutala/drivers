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
    }

    const available = ref(false);
    function setAvailable(value: boolean) {
      available.value = value;
    }

    const details = ref<{ [x: string]: any }>({});
    function setDetails(value: { [x: string]: any }) {
      details.value = value;
    }

    return {
      theme,
      setTheme,
      usedTheme,

      statusBar,
      setStatusBar,

      mode,
      setMode,

      available,
      setAvailable,

      details,
      setDetails,

      init,
    };
  },
  { persist: true }
);

export default useAppStore;
