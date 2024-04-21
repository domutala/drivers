<script lang="ts" setup>
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { ScreenOrientation } from "@capacitor/screen-orientation";

const theme = useTheme();
const router = useRouter();
const initing = ref(false);

onMounted(async () => {
  initing.value = true;

  App.addListener("backButton", ({ canGoBack }) => {
    if (!canGoBack) App.minimizeApp();
    else router.back();
  });

  addEventListener("theme:change", (e: any) => {
    theme.global.name.value = e.detail;
    Theme.update();
  });
  Theme.init();

  addEventListener("backButton", (e) => e.stopPropagation());

  if (Capacitor.getPlatform() !== "web") {
    await Cap.plugins.fullscreen.enable({ mode: "status-bar" });
    await StatusBar.setBackgroundColor({ color: "#00000000" });
    await StatusBar.setStyle({ style: Style.Dark });

    // const infos = await StatusBar.getInfo();
    // Store.app.setStatusBar({ height: (infos as any).height });
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
      <div style="position: fixed; top: 10px; left: 10px; z-index: 2500">
        <v-btn
          v-if="Store.app.mode === 'traveller'"
          @click="Store.app.setMode('driver')"
        >
          mode conducteur
        </v-btn>
        <v-btn v-else @click="Store.app.setMode('traveller')">
          mode voyage
        </v-btn>
      </div>
      <nuxt-page />
    </div>
  </v-app>
</template>
