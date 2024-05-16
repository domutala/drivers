<script lang="ts" setup>
const { $router } = useNuxtApp();

onMounted(mounted);
async function mounted() {
  $router.replace({ name: "console" });
}
</script>

<template>
  <ui-logo-page />
</template>
