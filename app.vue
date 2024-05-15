<script lang="ts" setup>
import CAppSetter from "~/components/app-setter.vue";

const initing = ref(false);
const appSetter = ref<InstanceType<typeof CAppSetter>>();

onMounted(mounted);
onNuxtReady(mounted);
async function mounted() {
  initing.value = true;

  try {
    await appSetter.value?.setter();
    await Store.app.init();
  } finally {
    initing.value = false;
  }
}
</script>

<template>
  <v-app>
    <c-app-setter ref="appSetter" />
    <ui-logo-page v-if="initing" />
    <nuxt-page v-else />
  </v-app>
</template>
