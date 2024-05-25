<script lang="ts" setup>
import { Marker, type Map } from "mapbox-gl";
import type { ITravel } from "~/models/Travel";

const props = defineProps({
  map: { type: Object as PropType<Map>, required: true },
});

const { t } = useI18n({ useScope: "local" });
const { $mapbox } = useNuxtApp();
const markerDepartue = ref<Marker>();
const markerDestination = ref<Marker>();
const container = ref<HTMLDivElement>();

onMounted(mounted);
async function mounted() {
  setTimeout(async () => {
    if (!Store.traveller.current.value) {
      Store.traveller.setCurrent({ step: "define_route" });
      return;
    }

    Socket.socket.on("travel_await_driver_expired", onAwaitExpired);

    const response = await Socket.emit(
      "travel/search-driver",
      Store.traveller.current.value.travel
    );

    console.log({ ...Store.traveller.current.value, travel: response }, "*");

    Store.traveller.setCurrent({
      step: "search_driver",
      value: { ...Store.traveller.current.value, travel: response },
    });

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

    try {
      markerDepartue.value = new Marker({ color: "red", rotation: 45 })
        .setLngLat(Store.traveller.current.value.travel.departure)
        .addTo(props.map);

      markerDestination.value = new Marker({ color: "green", rotation: 45 })
        .setLngLat(Store.traveller.current.value.travel.destination)
        .addTo(props.map);
      if (props.map.getSource("line")) {
        const e = props.map.getSource("line") as any;
        e.setData(Store.traveller.current.value.route.geojson);
      } else {
        props.map.addLayer({
          type: "line",
          id: "line",
          source: {
            type: "geojson",
            lineMetrics: true,
            data: Store.traveller.current.value.route.geojson as any,
          },
          paint: { "line-color": "#1fff62", "line-width": 4 },
          layout: { "line-cap": "round", "line-join": "round" },
        });
      }
    } finally {
    }
  }, 100);
}

function onAwaitExpired(travel: ITravel) {
  Store.traveller.setCurrent({
    step: "define_route",
    value: { ...Store.traveller.current.value!, travel },
  });
}
onBeforeUnmount(destroy);
onDeactivated(destroy);
function destroy() {
  if (props.map.getSource("line")) props.map.removeSource("line");
  if (markerDepartue.value) markerDepartue.value.remove();
  if (markerDestination.value) markerDestination.value.remove();
}
</script>

<template>
  <div
    v-if="Store.traveller.current.value"
    ref="container"
    class="bg-background rounded-t-xl"
    style="
      box-shadow: rgba(var(--v-theme-on-background), 0.2) 0px 7px 29px 0px;
      position: relative;
    "
  >
    <v-btn
      rounded="pill"
      color="dark"
      variant="tonal"
      size="32"
      class="ml-5 mt-3"
      @click="
        Store.traveller.setCurrent({
          step: 'define_route',
          value: Store.traveller.current.value,
        })
      "
    >
      <i class="fi fi-rr-cross-small"></i>
    </v-btn>

    <div
      class="text-center py-16 border-b"
      style="opacity: 0.3; font-size: 18px"
    >
      {{ t("waiting_for_drivers") }}
    </div>
    <v-container>
      <div class="d-flex flex-column ga-2">
        <div class="d-flex align-center justify-center ga-5 mt-3">
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
          </div>
        </div>

        <v-progress-linear
          class="mx-auto mt-4"
          color="primary"
          height="5"
          style="width: 150px"
          rounded
          rounded-bar
          stream
          indeterminate
        />
      </div>
    </v-container>
  </div>
</template>

<i18n src="./lang.json"></i18n>
