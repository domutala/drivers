<script lang="ts" setup>
defineProps({
  extendBody: { type: Boolean, default: false },
  statusProps: { type: Object, default: {} },
});
</script>

<template>
  <v-app>
    <div
      v-if="!extendBody"
      v-bind="statusProps"
      :style="{
        position: 'fixed',
        backgroundColor: 'rgba(var(--v-theme-background))',
        height: `${Store.app.statusBar.height}px`,
        width: '100%',
        zIndex: 1005,
      }"
    ></div>
    <div
      v-if="!extendBody"
      :style="{ height: `${Store.app.statusBar.height}px` }"
    ></div>
    <slot />
  </v-app>
</template>
