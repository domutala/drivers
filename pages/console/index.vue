<script lang="ts" setup>
import pgTravel from "~/components/travel/index.vue";
import pgDriver from "~/components/driver/index.vue";
</script>

<template>
  <pg-travel v-if="Store.app.mode === 'traveller'" />
  <pg-driver v-else />
</template>
