<script lang="ts" setup>
import cMenu from "~/components/menu.vue";

const { $router } = useNuxtApp();
const wait = ref(false);

onMounted(mounted);
function mounted() {
  wait.value = true;

  if (!Store.session.session.user) {
    return $router.replace({ name: "login" });
  }

  if (Store.session.session.status === "tobevalidate") {
    return $router.replace({ name: "login-validation" });
  }

  wait.value = false;

  if ($router.currentRoute.value.name === "console") {
    if (!Store.session.session.user.details.name) {
      return $router.replace({ name: "console-user-update-details" });
    }
  }
}
</script>

<template>
  <v-layout>
    <ui-logo-page v-if="wait" />
    <nuxt-page v-else />
  </v-layout>
</template>
