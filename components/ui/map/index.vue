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
const mapContainer = ref<HTMLDivElement>();
const map = ref<mapboxgl.Map>();
const ready = ref(false);
const isDragging = ref(false);

onMounted(init);

async function init() {
  if (!mapContainer.value) return;

  const _map = $mapbox.createMap({
    center: Store.position.position,
    zoom: 16,
    ...props.options,
    container: mapContainer.value,
  });

  _map.on("load", () => {
    map.value = _map;
    map.value.touchZoomRotate.disableRotation();
    ready.value = true;
    emit("ready", map.value!);

    map.value!.on("drag", () => {
      isDragging.value = true;
    });
    map.value!.on("dragend", () => {
      isDragging.value = false;
    });
  });
}

defineExpose({ map });
</script>

<template>
  <div ref="mapContainer"></div>

  <div class="ui-map-bottom">
    <transition
      appear
      enter-active-class="animate__fadeInUp"
      leave-active-class="animate__fadeOutDown"
    >
      <div
        v-show="!isDragging"
        class="animate__animated ui-map-bottom--container"
        style="animation-duration: 0.25s"
      >
        <slot name="bottom" :map="map" :ready="ready" />
      </div>
    </transition>
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
