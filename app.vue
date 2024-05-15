<script lang="ts" setup>
import { StatusBar, Style } from "@capacitor/status-bar";
import cPositionAsk from "~/components/position-ask.vue";
import cNoAvailable from "~/components/no-available.vue";

import cGeoRoute from "~/components/geo-route/index.vue";
import cTravelDisplay from "~/components/travel/display.vue";

const theme = useTheme();
const initing = ref(false);
const { $router, $mapbox } = useNuxtApp();

async function step1() {
  addEventListener("theme:change", async (e: any) => {
    theme.global.name.value = e.detail;
    await Theme.update();
    await StatusBar.setBackgroundColor({ color: "#00000000" });
    await Cap.plugins.fullscreen.enable({ mode: "status-bar" });
    await StatusBar.setOverlaysWebView({ overlay: true });
    await StatusBar.setStyle({
      style: Store.app.usedTheme === "light" ? Style.Light : Style.Dark,
    });
  });
  Theme.init();
  await Store.app.init();
}

async function step2() {
  await Store.position.init();
}

async function step3() {
  await Store.session.init();
  await Store.traveller.init();
  await Store.driver.init();
}

onMounted(async () => {
  initing.value = true;

  await step1();
  await step2();
  await step3();

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
    <c-position-ask v-else-if="!Store.position.position.authorized" />
    <c-no-available v-else-if="!Store.app.available" />
    <div v-else>
      <!-- <nuxt-page /> -->
      <!-- <c-geo-route /> -->
      <c-travel-display />
    </div>
  </v-app>
</template>
