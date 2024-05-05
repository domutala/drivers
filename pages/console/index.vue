<script lang="ts" setup>
import pgTravel from "~/components/travel/index.vue";
import pgDriver from "~/components/driver/index.vue";
import cNavbar from "~/components/navbar.vue";
</script>

<template>
  <c-navbar />

  <pg-travel v-if="Store.app.mode === 'traveller'" />
  <pg-driver v-else />
</template>
