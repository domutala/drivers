<script lang="ts" setup>
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { NavigationBar } from "@hugotomazi/capacitor-navigation-bar";

const { $vuetify } = useNuxtApp();

onMounted(mounted);
function mounted() {
  const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  darkModeMediaQuery.addEventListener("change", () => {
    Store.app.setMode(Store.app.mode.value);
  });
}

watch(() => Store.app.mode.use, setter);
async function setter() {
  $vuetify.theme.global.name.value = Store.app.mode.use;
  const isDark = Store.app.mode.use === "dark";

  await Utils.sleep(100);

  if (Capacitor.getPlatform() !== "web") {
    const computedStyle = window.getComputedStyle(document.documentElement);
    const color = computedStyle
      .getPropertyValue("--v-theme-background")
      .trim()
      .split(",")
      .map((x) => parseInt(x));

    const infos = await StatusBar.getInfo();
    Store.app.setStatusBar({ height: infos.height });

    await StatusBar.setBackgroundColor({ color: "#ff000000" });
    await StatusBar.setOverlaysWebView({ overlay: true });
    await StatusBar.setStyle({ style: !isDark ? Style.Light : Style.Dark });

    await NavigationBar.setColor({
      color: rgbToHex(color),
      darkButtons: !isDark,
    });
  }
}

function rgbToHex(rgb: number[]): string {
  const hex = rgb.map((val) => {
    const hexVal = val.toString(16).toUpperCase();
    return hexVal.length === 1 ? "0" + hexVal : hexVal; // Assurer que chaque composante a deux chiffres hexadécimaux
  });

  return `#${hex.join("")}`;
}

defineExpose({ setter });
</script>

<template></template>
