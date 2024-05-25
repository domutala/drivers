<script lang="ts" setup>
import type { IPoint } from "~/models/Map";
import cSelecter from "./selecter.vue";
import type { Map } from "mapbox-gl";

const props = defineProps({
  map: { type: Object as PropType<Map>, required: true },
});

const { t } = useI18n({ useScope: "local" });
const { $mapbox } = useNuxtApp();
const container = ref<HTMLDivElement>();
const departure = ref<IPoint>();
const destination = ref<IPoint>();
const activePoint = ref<"departure" | "destination">();
const routing = ref(false);

onMounted(mounted);
async function mounted() {
  if (Store.traveller.current.value) {
    departure.value = Store.traveller.current.value.travel.departure;
    destination.value = Store.traveller.current.value.travel.destination;
  } else {
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

  activePoint.value = "destination";
}

watch(() => departure.value, defineRoute, { deep: true });
watch(() => destination.value, defineRoute, { deep: true });
function defineRoute() {
  setTimeout(async () => {
    if (!departure.value) return;
    if (!destination.value) return;
    if (
      destination.value.lat === departure.value.lat &&
      destination.value.lng === departure.value.lng
    ) {
      return;
    }

    try {
      routing.value = true;

      const routes = await $mapbox.route({
        departure: departure.value,
        destination: destination.value,
      });
      const _route = routes[0];
      const id = Store.traveller.current.value?.travel.id;

      Store.traveller.setCurrent({
        step: "define_route",
        value: {
          route: _route,
          travel: {
            departure: departure.value,
            destination: destination.value,
            distance: _route.meta.distance,
            duration: _route.meta.duration,
            price: _route.meta.price,
            step: "define_route",
            id: id as string,
          },
        },
      });

      try {
        if (props.map.getLayer("line")) {
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
      }
    } finally {
      routing.value = false;
    }
  }, 100);
}

watch(() => activePoint.value, onActivePoint);
function onActivePoint() {
  if (!activePoint.value) {
    if (Store.traveller.current.value) {
      if (container.value) {
        props.map.fitBounds(Store.traveller.current.value.route.meta.bounds, {
          padding: {
            bottom: container.value.getBoundingClientRect().height + 50,
            left: 50,
            right: 50,
            top: 50,
          },
        });
      }
    }
  }
}

onBeforeUnmount(destroy);
onDeactivated(destroy);
function destroy() {
  if (props.map.getSource("line")) props.map.removeSource("line");
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
          :placeholder="t('starting_point')"
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
          :placeholder="t('were_do_you_go')"
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

        <div
          v-if="Store.traveller.current.value"
          class="d-flex align-center justify-center ga-5 mt-3"
        >
          <div class="d-flex align-center ga-2 py-1">
            <i class="fi fi-rr-clock-five"></i>
            {{
              Utils.Number.format.duration(
                Store.traveller.current.value.travel.duration
              )
            }}
          </div>
          <div class="d-flex align-center ga-2">
            <i class="fi fi-rr-route"></i>
            {{
              Utils.Number.format.distance(
                Store.traveller.current.value.travel.distance
              )
            }}
          </div>
          <div class="d-flex align-center ga-2">
            <i class="fi fi-rr-receipt"></i>
            {{ Store.traveller.current.value.travel.price.amount }}
            {{ Store.traveller.current.value.travel.price.currency }}
            <v-btn icon size="24" color="dark" variant="tonal">
              <i class="fi fi-sr-pencil" style="font-size: 11px"></i>
            </v-btn>
          </div>
        </div>

        <v-btn
          v-if="Store.traveller.current.value"
          color="primary"
          rounded="pill"
          size="x-large"
          class="mx-auto"
          @click="
            Store.traveller.setCurrent({
              step: 'search_driver',
              value: Store.traveller.current.value,
            })
          "
        >
          {{ t("submit") }}
        </v-btn>
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

<i18n src="./lang.json"></i18n>
