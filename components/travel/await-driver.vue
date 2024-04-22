<script lang="ts" setup>
import L from "leaflet";
import type { ITravel } from "~/models/Travel";

const props = defineProps({
  map: { type: Object as PropType<L.Map>, required: true },
});
const { $map } = useNuxtApp();
const route = ref<L.Routing.Control>();
const hideBottom = ref(false);
const routing = ref(false);

const offer = computed(() => {
  return Store.travel.current!.accepts.filter((offer) => offer.accepted)[0];
});

onMounted(mounted);
function mounted() {
  props.map.on("dragstart", () => (hideBottom.value = true));
  props.map.on("dragend", () => (hideBottom.value = false));
  initRoute();
}

function toCenter() {
  if (!props.map) return;
  props.map.setZoom(16);
  props.map.setView(Store.position.position.current!);
}

function initRoute() {
  if (!props.map) return;
  if (!route.value) {
    const departure = L.latLng(offer.value.position);
    const arrival = L.latLng(Store.position.position.current);

    route.value = L.Routing.control({
      waypoints: [departure, arrival],
      draggableWaypoints: false,
      addWaypoints: false,
      lineOptions: {
        styles: [{ color: "#0089ff", opacity: 1, weight: 6 }],
      },
      // showAlternatives: true,
      // altLineOptions: {
      //   styles: [{ color: "#0089ff", opacity: 0.4, weight: 6 }],
      // },
      createMarker: function (i: number, waypoint: any, n: number) {
        const svgIcon = L.divIcon({
          html: i === 1 ? $map.icons.spin : $map.icons.point,
          className: "",
          iconAnchor: i === 1 ? [24, 48] : undefined,
          iconSize: i === 0 ? [24, 24] : [48, 48],
        });

        const marker = L.marker(waypoint.latLng, {
          draggable: false,
          icon: svgIcon,
        });

        return marker;
      },
      createStep() {
        return null;
      },
    } as any).addTo(props.map);

    route.value.on("routingstart", () => (routing.value = true));
    route.value.on("routesfound", () => (routing.value = false));
    route.value.on("routingerror", () => (routing.value = false));
  }

  updateWaypoint();
}

function updateWaypoint() {
  if (!route.value) return;
  if (!props.map) return;

  const departure = L.latLng(offer.value.position);
  const arrival = L.latLng(Store.position.position.current);

  route.value.setWaypoints([departure, arrival]);
}

async function findDriver() {
  if (!Store.travel.current) return;

  const travel = await Socket.emit<ITravel>(
    "travel:search-driver",
    Store.travel.current
  );

  Store.travel.setCurrent(travel);
}

onBeforeUnmount(destroy);
onDeactivated(destroy);
function destroy() {
  if (route.value) {
    props.map.removeControl(route.value);
    route.value = undefined;
  }

  props.map.off("drag");
  props.map.off("dragstart");
  props.map.off("dragend");
}
</script>

<template>
  <div
    style="
      position: fixed;
      top: 40px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
      user-select: none;
      cursor: pointer;
      width: 500px;
      max-width: 90%;
    "
  >
    <v-text-field
      bg-color="background"
      placeholder="Ou allez-vous ?"
      variant="solo-filled"
      readonly
      rounded
    >
      <template #prepend-inner>
        <i
          class="fi fi-rr-track mr-2 ml-2"
          style="font-size: 24px; opacity: 0.5"
        ></i>
      </template>
    </v-text-field>
  </div>

  <transition
    apper
    enter-active-class="animate__animated animate__slideInUp"
    leave-active-class="animate__animated animate__slideOutDown"
  >
    <div
      v-if="Store.travel.current"
      v-show="!hideBottom && !routing"
      class="travel-await-driver--bottom"
    >
      <!-- bottom -->
    </div>
  </transition>

  <div style="position: fixed; bottom: 20px; right: 30px; z-index: 20000">
    <v-progress-circular
      v-if="routing"
      color="primary"
      indeterminate
      :size="32"
      :width="5"
    />
    <v-btn
      v-else
      icon
      @click="toCenter"
      color="background"
      variant="elevated"
      class="border"
    >
      <i class="fi fi-rr-location-crosshairs" style="font-size: 22px"></i>
    </v-btn>
  </div>
</template>

<style lang="scss" scoped>
.travel-await-driver--bottom {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  z-index: 1000;
  animation-duration: 0.25s;
  pointer-events: none;

  > div {
    pointer-events: auto;
    box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
    margin: auto;
    margin-bottom: 0px;
    width: 500px;
    max-width: 100%;

    @media (width> 500px) {
      border-top-right-radius: 0.9em;
      border-top-left-radius: 0.9em;
      border-radius: 0.9em;
      margin-bottom: 20px;
    }
  }
}
</style>

<style lang="scss">
.travel-await-driver--summary-price-input {
  .v-field {
    padding-left: 4px;
    padding-right: 4px;

    input {
      text-align: center;
      font-weight: bold;
    }
  }
}

.travel-await-driver--home-marker-mobile {
  --v-theme-primary: 0, 0, 0;
}
</style>
