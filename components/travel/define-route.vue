<script lang="ts" setup>
import L from "leaflet";
import type { ITravel } from "~/models/Travel";

const props = defineProps({
  map: { type: Object as PropType<L.Map>, required: true },
});
const { $map } = useNuxtApp();
const marker = ref<L.Marker>();
const curentPositionMarker = ref<L.Marker>();
const route = ref<L.Routing.Control>();
const hideBottom = ref(false);
const routing = ref(false);
const initing = ref(false);

onMounted(mounted);
function mounted() {
  curentPositionMarker.value = L.marker(Store.position.position.current!, {
    draggable: false,
    icon: L.divIcon({
      html: $map.icons.point,
      className: "",
      iconSize: [24, 24],
    }),
  }).addTo(props.map);

  marker.value = L.marker(Store.position.position.current, {
    draggable: false,
    opacity: 0,
    icon: L.divIcon({
      html: $map.icons.point,
      className: "travel-define-route--home-marker-mobile",
      iconSize: [24, 24],
    }),
  }).addTo(props.map);

  props.map.on("drag", () => marker.value!.setLatLng(props.map!.getCenter()));
  props.map.on("dragstart", () => marker.value!.setOpacity(1));
  props.map.on("dragend", () => marker.value!.setOpacity(0));

  props.map.on("dragstart", () => (hideBottom.value = true));
  props.map.on("dragend", () => (hideBottom.value = false));

  props.map.on("dragend", initRoute);

  if (Store.travel.current) initRoute();
}

function toCenter() {
  if (!props.map) return;
  if (!marker.value) return;

  props.map.setZoom(16);
  props.map.setView(Store.position.position.current!);

  if (route.value) props.map.removeControl(route.value);
  route.value = undefined;
  marker.value.setLatLng(Store.position.position.current!);
}

function initRoute() {
  if (!props.map) return;
  if (!route.value) {
    const departure = L.latLng(Store.position.position.current);
    const arrival = L.latLng(Store.travel.current?.to || props.map.getCenter());

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

    // route.value.on("routingstart", () => (summary.value = undefined));
    route.value.on("routesfound", async (e) => {
      // route.value!.
      initing.value = true;
      const routes = e.routes;

      if (routes.length > 0) {
        const route = routes[0];

        const travel = await Socket.emit<ITravel>("travel:init", {
          ...(Store.travel.current || {}),
          distance: route.summary.totalDistance,
          time: route.summary.totalTime,
          from: route.waypoints[0].latLng,
          to: route.waypoints[1].latLng,
        });

        Store.travel.setCurrent(travel);
      }

      initing.value = false;
    });
  }

  updateWaypoint();
}

function updateWaypoint() {
  if (!route.value) return;
  if (!props.map) return;

  const departure = L.latLng(Store.position.position.current);
  const arrival = L.latLng(props.map.getCenter());

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
  if (marker.value) marker.value.remove();
  if (curentPositionMarker.value) curentPositionMarker.value.remove();

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
      v-show="!initing && !routing"
      class="travel-define-route--bottom"
    >
      <div class="bg-background">
        <div class="border-b pa-2 d-flex align-center justify-center ga-2">
          <i class="fi fi-rr-route text-primary"></i>
          {{ Num.formatDistance(Store.travel.current.distance) }}

          <div class="mx-2 text-center">-</div>

          <i class="fi fi-rr-stopwatch text-primary"></i>
          {{ Num.formatDuration(Store.travel.current.time) }}
        </div>
        <div class="pa-5">
          <div class="my-5">
            <div class="d-flex align-center justify-center ga-3">
              <v-btn
                rounded="pill"
                variant="tonal"
                size="28"
                color="dark"
                icon
                :disabled="Store.travel.current.price === 0"
                @click="
                  Store.travel.setCurrent({
                    ...Store.travel.current,
                    price: Store.travel.current.price - 1,
                  })
                "
              >
                <i class="fi fi-br-minus"></i>
              </v-btn>
              <div class="text-h2 font-weight-bold d-flex ga-2">
                <span style="opacity: 0.3">
                  MAD
                  <!-- {{ Store.app.currency }} -->
                </span>
                <span>{{ Store.travel.current.price }}</span>
              </div>
              <v-btn
                rounded="pill"
                size="28"
                variant="tonal"
                color="dark"
                icon
                @click="
                  Store.travel.setCurrent({
                    ...Store.travel.current,
                    price: Store.travel.current.price + 1,
                  })
                "
              >
                <i class="fi fi-br-plus"></i>
              </v-btn>
            </div>
            <div class="text-center">Vous pouvez proposer un prix</div>
          </div>

          <div class="d-flex justify-center mt-10">
            <v-btn rounded="pill" size="large" @click="findDriver">
              Trouver un conducteur
            </v-btn>
          </div>
        </div>
      </div>
    </div>
  </transition>

  <div style="position: fixed; bottom: 20px; right: 30px; z-index: 20000">
    <v-progress-circular
      v-if="routing || initing"
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
.travel-define-route--bottom {
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
.travel-define-route--summary-price-input {
  .v-field {
    padding-left: 4px;
    padding-right: 4px;

    input {
      text-align: center;
      font-weight: bold;
    }
  }
}

.travel-define-route--home-marker-mobile {
  --v-theme-primary: 0, 0, 0;
}
</style>
