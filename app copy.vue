<script lang="ts" setup>
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { StatusBar } from "@capacitor/status-bar";
import CNavbar from "~/components/navbar.vue";

const theme = useTheme();
const router = useRouter();
const initing = ref(false);

onMounted(async () => {
  initing.value = true;
  // Keyboard.setResizeMode({ mode: KeyboardResize.Body });

  App.addListener("backButton", (e) => {
    const overlay = document.querySelector(
      ".v-overlay-container .v-overlay--active .v-overlay__scrim"
    ) as HTMLElement;
    if (overlay) {
      console.log("oki");
      // overlay.click();
    } else if (!e.canGoBack) App.minimizeApp();
    else router.back();
  });

  addEventListener("theme:change", async (e: any) => {
    theme.global.name.value = e.detail;
    await Theme.update();
    await StatusBar.setBackgroundColor({ color: "#00000000" });
    await Cap.plugins.fullscreen.enable({ mode: "status-bar" });
    await StatusBar.setOverlaysWebView({ overlay: true });
  });
  Theme.init();

  addEventListener("backButton", (e) => e.stopPropagation());

  if (Capacitor.getPlatform() !== "web") {
    const infos = await StatusBar.getInfo();
    Store.app.setStatusBar({ height: (infos as any).height });
    // await ScreenOrientation.lock({ orientation: "portrait" });
  }

  await Store.app.init();
  await Store.session.init();
  await Store.position.init();
  await Store.travel.init();

  initing.value = false;
});
</script>

<template>
  <v-app>
    <div
      v-if="initing"
      style="
        width: 100%;
        height: 100%;
        position: fixed;
        display: flex;
        align-items: center;
        justify-content: center;
      "
    >
      <v-progress-circular indeterminate :size="43" :width="5" />
    </div>
    <div v-else-if="!Store.position.position.authorized">
      <v-btn @click="Store.position.init">authoriser</v-btn>
    </div>
    <div v-else>
      <c-navbar />
      <nuxt-page />
    </div>
  </v-app>
</template>
