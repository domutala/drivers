<script lang="ts" setup>
import pgTravel from "~/components/travel/index.vue";
import pgDrive from "~/components/drive.vue";
</script>

<template>
  <pg-travel v-if="Store.app.mode === 'traveller'" />
  <pg-drive v-else />
  <div
    style="
      position: fixed;
      top: 100%;
      width: 100%;
      z-index: 999;
      box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
      height: 20px;
    "
  ></div>
</template>
