<script lang="ts" setup>
import L from "leaflet";
import TravelDefineRoute from "./define-route.vue";
import TravelSearchDriver from "./search-driver.vue";

const { $map } = useNuxtApp();
const mapContainer = ref<HTMLElement>();
const map = ref<L.Map>();

onMounted(mounted);
function mounted() {
  if (!mapContainer.value) return;
  map.value = $map.init(mapContainer.value);
}
</script>

<template>
  <div style="position: fixed; width: 100%; height: 100%">
    <div
      ref="mapContainer"
      id="map"
      style="position: absolute; width: 100%; height: 100%"
    ></div>
  </div>

  <span v-if="map">
    <travel-define-route
      v-if="
        !Store.travel.current || Store.travel.current.step === 'define_route'
      "
      :map="map"
    />
    <span v-else-if="Store.travel.current">
      <travel-search-driver
        v-ele="Store.travel.current.step === 'search_driver'"
        :map="map"
      />
    </span>
  </span>
</template>
