<script lang="ts" setup>
import pgTravel from "~/components/travel/index.vue";
import pgDrive from "~/components/drive.vue";
</script>

<template>
  <pg-travel v-if="Store.app.mode === 'traveller'" />
  <pg-drive v-else />

  <nuxt-page />
</template>
