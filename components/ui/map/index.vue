<script lang="ts" setup>
import mapboxgl from "mapbox-gl";

const { $mapbox } = useNuxtApp();
const map = ref<mapboxgl.Map>();

onMounted(init);

async function init() {
  map.value = $mapbox.createMap({
    container: "map",
    center: Store.position.position,
    zoom: 16,
  });

  map.value.on("load", async () => {
    if (!map.value) return;
  });
}
</script>

<template>
  <div id="map"></div>
</template>
