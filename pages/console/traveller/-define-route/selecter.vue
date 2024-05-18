<script lang="ts" setup>
import { LngLat, Map, Marker, type LngLatLike } from "mapbox-gl";
import type { IPoint } from "~/models/Map";
import cPlaces from "./places.vue";

const emit = defineEmits<{
  (e: "update:modelValue", point: IPoint): void;
  (e: "active", value: boolean): void;
}>();

const props = defineProps({
  active: { type: Boolean, default: false },
  map: { type: Object as PropType<Map>, required: true },
  modelValue: { type: Object as PropType<IPoint> },
  markerColor: { type: String, default: "red" },
  placeholder: { type: String, required: true },
});

const { $mapbox } = useNuxtApp();
const marker = ref<Marker>();
const openPlace = ref(false);

onMounted(setDefault);
watch(() => props.active, setDefault);
async function setDefault() {
  if (props.active) {
    if (!props.modelValue) {
      const point = await getPointFromLatLng(Store.position.position);
      if (point) emit("update:modelValue", point);
    } else {
      props.map.flyTo({ center: props.modelValue });
    }

    setTimeout(() => {
      if (props.modelValue) {
        props.map.flyTo({ center: props.modelValue });
      }
    }, 100);
  }
}

watch(() => props.modelValue, onModelValue, { deep: true });
onMounted(onModelValue);
function onModelValue() {
  if (props.modelValue) {
    if (!marker.value) {
      marker.value = new Marker({ color: props.markerColor, rotation: 45 })
        .setLngLat(props.modelValue)
        .addTo(props.map);

      marker.value.getElement().addEventListener("click", () => {
        emit("active", true);
        openPlace.value = true;
      });
    }

    marker.value.setLngLat(props.modelValue);
  }
}

onMounted(setDrag);
function setDrag() {
  props.map.on("drag", onDrag);
  props.map.on("dragend", onDragend);
}

function onDrag() {
  if (!props.active) return;
  if (!marker.value) return;

  marker.value.setLngLat(props.map.getCenter());
}

function onDragend() {
  if (!props.active) return;
  if (!marker.value) return;

  const _point = marker.value.getLngLat();
  props.map.flyTo({ center: _point });

  setTimeout(async () => {
    const features = await $mapbox.lookup({
      latitude: _point.lat,
      longitude: _point.lng,
    });

    const feature = features.features[0];
    if (!feature) return;

    const point = await getPointFromLatLng(_point);
    if (point) emit("update:modelValue", point);
  }, 0);
}

async function getPointFromLatLng(_point: { lat: number; lng: number }) {
  const features = await $mapbox.lookup({
    latitude: _point.lat,
    longitude: _point.lng,
  });

  const feature = features.features[0];
  if (!feature) return;

  return {
    lat: _point.lat,
    lng: _point.lng,
    name: feature.properties.name_preferred,
    place: feature.properties.place_formatted,
  };
}

function onPlaceSelect(_point: IPoint) {
  openPlace.value = false;
  props.map.flyTo({ center: _point });
  emit("update:modelValue", _point);
}

onBeforeUnmount(destroy);
onDeactivated(destroy);
function destroy() {
  if (marker.value) marker.value.remove();

  props.map.off("drag", onDrag);
  props.map.off("dragend", onDragend);
}
</script>

<template>
  <v-bottom-sheet v-model="openPlace" class="pg-traveller-select-choice">
    <template #activator="{ props }">
      <div
        v-bind="props"
        class="pa-3"
        style="
          background-color: rgba(var(--v-theme-on-background), 0.08);
          border-radius: 0.9em;
          display: flex;
          align-items: center;
          height: 64px;
          overflow: hidden;
        "
        @click="emit('active', true)"
      >
        <div
          style="
            width: 42px;
            display: flex;
            align-items: center;
            justify-content: center;
          "
        >
          <slot name="icon" />
        </div>

        <div v-if="modelValue" style="line-height: 1">
          <div style="font-size: 16px; padding: 0">
            {{ modelValue.name || $t("street_without_name") }}
          </div>
          <div style="font-size: 80%; padding: 0; opacity: 0.5">
            {{ modelValue.place }}
          </div>
        </div>
        <div v-else>
          {{ placeholder }}
        </div>

        <v-spacer />
        <v-btn v-if="active" size="28" icon @click.stop="emit('active', false)">
          <i class="fi fi-br-check" style="font-size: 12px"></i>
        </v-btn>
      </div>
    </template>
    <c-places @select="onPlaceSelect" @close="openPlace = false" />
  </v-bottom-sheet>
</template>
