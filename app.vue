<script lang="ts" setup>
import CAppSetter from "~/components/app-setter.vue";

const initing = ref(false);
const appSetter = ref<InstanceType<typeof CAppSetter>>();

onMounted(mounted);
// onNuxtReady(mounted);
async function mounted() {
  initing.value = true;

  try {
    Store.session.setInited(false);

    await Store.app.init();
    await appSetter.value?.setter();
    await Store.position.init();
    await Store.session.init();

    Store.session.setInited(true);
  } finally {
    initing.value = false;
  }
}
</script>

<template>
  <c-app-setter ref="appSetter" />
  <span v-if="initing">
    Lorem ipsum dolor, sit amet consectetur adipisicing elit. Aliquid cum magni
    placeat deserunt aspernatur error explicabo vitae distinctio, laborum
    pariatur ea fuga blanditiis ut quos iure? Illum nostrum vel accusamus!
    {{ initing }}
  </span>
  <!-- <ui-logo-page v-if="initing" /> -->
  <nuxt-page v-else />
</template>
