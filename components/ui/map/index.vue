<script lang="ts" setup>
import mapboxgl from "mapbox-gl";

const props = defineProps({
  options: {
    type: Object as PropType<Partial<mapboxgl.MapboxOptions>>,
    default: {},
  },
});
const emit = defineEmits<{ (e: "ready", map: mapboxgl.Map): void }>();

const { $mapbox } = useNuxtApp();
const map = ref<mapboxgl.Map>();
const ready = ref(false);
const mapContainer = ref<HTMLDivElement>();

onMounted(init);

async function init() {
  if (!mapContainer.value) return;

  map.value = $mapbox.createMap({
    center: Store.position.position,
    zoom: 16,
    ...props.options,
    container: mapContainer.value,
  });

  map.value.on("style.load", () => {
    map.value!.touchZoomRotate.disableRotation();
    ready.value = true;
    emit("ready", map.value!);
  });
}

defineExpose({ map });
</script>

<template>
  <div ref="mapContainer"></div>

  <div class="ui-map-bottom">
    <div class="ui-map-bottom--container">
      <slot name="bottom" :map="map" :ready="ready" />
    </div>
  </div>
</template>

<style lang="scss">
.ui-map-bottom {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;

  .ui-map-bottom--container {
    width: 100%;
    max-width: 662px;
    margin-left: auto;
    margin-right: auto;
  }
}
</style>
