<script lang="ts" setup>
const { $router } = useNuxtApp();

onMounted(mounted);
async function mounted() {
  $router.replace({ name: "login-validation" });
}
</script>

<template>
  <ui-logo-page />
</template>
