<script lang="ts" setup>
import cMenu from "~/components/menu.vue";
</script>

<template>
  <ui-page>
    <div
      :style="{ top: `${Store.app.statusBar.height + 20}px` }"
      style="position: fixed; right: 20px"
    >
      <c-menu>
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
      </c-menu>
    </div>
  </ui-page>
</template>
