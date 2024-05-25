<script lang="ts" setup>
import cDefineRoute from "./-define-route/index.vue";
import cSearchDriver from "./-search-driver/index.vue";
</script>

<template>
  <ui-page extend-body>
    <ui-map>
      <template #bottom="{ map }">
        <span v-if="map">
          <c-define-route
            v-if="Store.traveller.current.step === 'define_route'"
            :map="map"
          />
          <c-search-driver
            v-else-if="Store.traveller.current.step === 'search_driver'"
            :map="map"
          />
        </span>
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
