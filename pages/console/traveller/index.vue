<script lang="ts" setup>
import cDefineRoute from "./-define-route/index.vue";
</script>

<template>
  <ui-page extend-body>
    <ui-map>
      <template #bottom="{ map }">
        <c-define-route v-if="map" :map="map" />
      </template>
    </ui-map>

    <div
      :style="{ top: `${Store.app.statusBar.height + 20}px` }"
      style="position: fixed; right: 20px"
    >
      <ui-menu>
        <template #activator="{ props }">
          <v-btn
            color="background"
            v-bind="props"
            icon
            size="36"
            variant="flat"
            class="elevation-1"
          >
            <i class="fi fi-br-menu-dots-vertical"></i>
          </v-btn>
        </template>
      </ui-menu>
    </div>
  </ui-page>
</template>
