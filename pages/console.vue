<script lang="ts" setup>
const { $router } = useNuxtApp();

onMounted(() => {
  // if (!Store.session.session.user) {
  //   $router.replace({ name: "login" });
  // }
});
</script>

<template>
  <nuxt-page />
</template>
