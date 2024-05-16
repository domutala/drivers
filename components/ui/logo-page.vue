<template>
  <v-app>
    <div
      style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1005;
        display: flex;
        align-items: center;
        justify-content: center;
      "
      class="bg-background"
    >
      <svg-icon name="logo" width="72" height="72" />

      <div
        style="
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
        "
      >
        {{ $route.name }}
      </div>
    </div>
  </v-app>
</template>
