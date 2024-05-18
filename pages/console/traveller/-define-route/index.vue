<script lang="ts" setup>
import type { IMapRoute, IPoint } from "~/models/Map";
import cSelecter from "./selecter.vue";
import type { Map } from "mapbox-gl";

const props = defineProps({
  map: { type: Object as PropType<Map>, required: true },
});

const { $mapbox } = useNuxtApp();
const container = ref<HTMLDivElement>();
const departure = ref<IPoint>();
const destination = ref<IPoint>();
const activePoint = ref<"departure" | "destination">();
const routing = ref(false);
const route = ref<IMapRoute>();
// const e = 0;

onMounted(mounted);
async function mounted() {
  activePoint.value = "destination";
  const features = await $mapbox.lookup({
    latitude: Store.position.position.lat,
    longitude: Store.position.position.lng,
  });

  const feature = features.features[0];
  if (feature) {
    departure.value = {
      lat: Store.position.position.lat,
      lng: Store.position.position.lng,
      name: feature.properties.name_preferred,
      place: feature.properties.place_formatted,
    };
  }
}

watch(() => departure.value, defineRoute, { deep: true });
watch(() => destination.value, defineRoute, { deep: true });
async function defineRoute() {
  if (!departure.value) return;
  if (!destination.value) return;
  if (
    destination.value.lat === departure.value.lat &&
    destination.value.lng === departure.value.lng
  ) {
    return;
  }

  routing.value = true;

  try {
    const routes = await $mapbox.route({
      departure: departure.value,
      destination: destination.value,
    });

    route.value = routes[0];
    const line = props.map.getLayer("line");

    if (line) {
      const e = props.map.getSource("line") as any;
      e.setData(routes[0].geojson);
    } else {
      props.map.addLayer({
        type: "line",
        id: "line",
        source: {
          type: "geojson",
          lineMetrics: true,
          data: routes[0].geojson as any,
        },
        paint: { "line-color": "#1fff62", "line-width": 4 },
        layout: { "line-cap": "round", "line-join": "round" },
      });
    }
  } finally {
    routing.value = false;
  }
}

watch(() => activePoint.value, onActivePoint);
function onActivePoint() {
  if (!activePoint.value) {
    if (route.value) {
      if (container.value) {
        props.map.fitBounds(route.value.meta.bounds, {
          padding: {
            bottom: container.value.getBoundingClientRect().height + 20,
            left: 20,
            right: 20,
            top: 20,
          },
        });
      }
    }
  }
}

onBeforeUnmount(destroy);
onDeactivated(destroy);
function destroy() {
  if (props.map.getLayer("line")) props.map.removeLayer("line");
}
</script>

<template>
  <div
    ref="container"
    class="bg-background rounded-t-xl"
    style="box-shadow: rgba(var(--v-theme-on-background), 0.2) 0px 7px 29px 0px"
  >
    <v-container>
      <div class="d-flex flex-column ga-2">
        <c-selecter
          v-if="map"
          :map="map"
          v-model="departure"
          marker-color="red"
          placeholder="Point de départ"
          :active="activePoint === 'departure'"
          @active="(v) => (activePoint = v ? 'departure' : undefined)"
        >
          <template #icon>
            <div style="position: relative">
              <div
                style="
                  width: 15px;
                  height: 15px;
                  border: 4px solid red;
                  border-radius: 100%;
                "
              ></div>
              <div
                style="
                  position: absolute;
                  height: 100px;
                  top: calc(100% + 5px);
                  left: 50%;
                  transform: translateX(-50%);
                  border: 1px dashed rgba(var(--v-theme-on-background), 0.4);
                "
              ></div>
            </div>
          </template>
        </c-selecter>
        <c-selecter
          v-if="map"
          :map="map"
          v-model="destination"
          placeholder="Ou allez-vous ?"
          marker-color="green"
          :active="activePoint === 'destination'"
          @active="(v) => (activePoint = v ? 'destination' : undefined)"
        >
          <template #icon>
            <div style="position: relative">
              <i class="fi fi-sr-marker text-green"></i>
              <div
                style="
                  position: absolute;
                  height: 100px;
                  bottom: calc(100% + 5px);
                  left: 50%;
                  transform: translateX(-50%);
                  border: 1px dashed rgba(var(--v-theme-on-background), 0.4);
                "
              ></div>
            </div>
          </template>
        </c-selecter>

        <div v-if="route" class="d-flex align-center justify-center ga-5 mt-3">
          <div class="d-flex align-center ga-2 py-1">
            <i class="fi fi-rr-clock-five"></i>
            {{ Utils.Number.format.duration(route.meta.duration) }}
          </div>
          <div class="d-flex align-center ga-2">
            <i class="fi fi-rr-route"></i>
            {{ Utils.Number.format.distance(route.meta.distance) }}
          </div>
          <div class="d-flex align-center ga-2">
            <i class="fi fi-rr-receipt"></i>
            {{ route.meta.price.amount }}
            {{ route.meta.price.currency }}
            <v-btn icon size="24" color="dark" variant="tonal">
              <i class="fi fi-sr-pencil" style="font-size: 11px"></i>
            </v-btn>
          </div>
        </div>
      </div>
    </v-container>

    <div style="height: 5px">
      <v-progress-linear
        v-if="routing"
        color="primary"
        height="5"
        indeterminate
      />
    </div>
  </div>
</template>
