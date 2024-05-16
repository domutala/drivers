import { Device } from "@capacitor/device";
import { defineStore } from "pinia";
import { ref } from "vue";
import { beforeRestore } from "~/utils/Store";

export interface IAppMode {
  value: "light" | "dark" | null;
  use: "light" | "dark";
}

const store = defineStore(
  "app",
  () => {
    const statusBar = ref<{ height: number }>({ height: 0 });
    function setStatusBar(value: { height: number }) {
      statusBar.value = value;
    }

    const mode = ref<IAppMode>({ value: null, use: "light" });
    function setMode(value: "light" | "dark" | null) {
      function nativeMode() {
        let nativeThemeMode: "dark" | "light" = "dark";

        if (
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches
        ) {
          nativeThemeMode = "dark";
        } else {
          nativeThemeMode = "light";
        }

        return nativeThemeMode;
      }

      mode.value.value = value;

      let _mode = mode.value.value;
      if (_mode === null) _mode = nativeMode();

      mode.value.use = _mode;
    }

    const lang = ref<{ code: string }>({ code: "" });
    function setLang(value: string) {
      lang.value.code = value;
    }

    async function init() {
      if (!lang.value.code) {
        const { $i18n } = useNuxtApp();
        const code = await Device.getLanguageCode();
        if ($i18n.localeCodes.value.includes(code.value)) {
          $i18n.setLocale(code.value);
        }
      }
    }

    return { statusBar, setStatusBar, mode, setMode, lang, setLang, init };
  },
  { persist: { beforeRestore } }
);

export default store;
