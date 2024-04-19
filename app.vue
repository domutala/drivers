<script lang="ts" setup>
onMounted(mounted);
async function mounted() {
  await Store.position.init();
}
</script>

<template>
  <v-app>
    <div v-if="!Store.position.position.authorized">
      no authorized position

      <button @click="Store.position.init"></button>
    </div>
    <nuxt-page v-else />
  </v-app>
</template>
