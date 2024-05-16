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
      <v-progress-linear
        color="primary"
        height="10"
        style="width: 120px"
        indeterminate
        stream
        rounded
        rounded-bar
      />

      <div
        style="
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
        "
      >
        <svg-icon name="logo" width="32" height="32" />
      </div>
    </div>
  </v-app>
</template>
