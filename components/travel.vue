<script lang="ts" setup>
import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "@maptiler/leaflet-maptilersdk";
import "leaflet-routing-machine";
import type { ITravel } from "~/models/Travel";
const { $map } = useNuxtApp();

const mapContainer = ref<HTMLElement>();
const marker = ref<L.Marker>();
const map = ref<L.Map>();
const route = ref<L.Routing.Control>();
const hideBottom = ref(false);
const routing = ref(false);
const initing = ref(false);

onMounted(mounted);
function mounted() {
  if (!mapContainer.value) return;
  map.value = $map.init(mapContainer.value);

  L.marker(Store.position.position.current!, {
    draggable: false,
    icon: L.divIcon({
      html: $map.icons.point,
      className: "",
      iconSize: [24, 24],
    }),
  }).addTo(map.value);

  marker.value = L.marker(Store.position.position.current, {
    draggable: false,
    opacity: 0,
    icon: L.divIcon({
      html: $map.icons.point,
      className: "pg-home-marker-mobile",
      iconSize: [24, 24],
    }),
  }).addTo(map.value);

  map.value.on("drag", () => {
    if (Store.travel.current?.step !== "define_route") return;
    marker.value!.setLatLng(map.value!.getCenter());
  });
  map.value.on("dragstart", () => marker.value!.setOpacity(1));
  map.value.on("dragend", () => marker.value!.setOpacity(0));

  map.value.on("dragstart", () => (hideBottom.value = true));
  map.value.on("dragend", () => (hideBottom.value = false));

  map.value.on("dragend", initRoute);
}

function toCenter() {
  if (!map.value) return;
  if (!marker.value) return;

  map.value.setZoom(16);
  map.value.setView(Store.position.position.current!);
  if (Store.travel.current?.step !== "define_route") return;

  if (route.value) map.value.removeControl(route.value);
  route.value = undefined;
  marker.value.setLatLng(Store.position.position.current!);
}

function initRoute() {
  if (!map.value) return;
  if (!route.value) {
    const departure = L.latLng({ lat: 51.5, lng: -0.09 });
    const arrival = L.latLng({ lat: 51.51, lng: -0.1 });

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
    } as any).addTo(map.value);

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
  if (Store.travel.current?.step !== "define_route") return;
  if (!route.value) return;
  if (!map.value) return;

  const departure = L.latLng(Store.position.position.current);
  const arrival = L.latLng(map.value.getCenter());

  route.value.setWaypoints([departure, arrival]);
}

async function findDriver() {
  if (!Store.travel.current) return;

  const travel = await Socket.emit<ITravel>(
    "travel:find-driver",
    Store.travel.current
  );

  Store.travel.setCurrent(travel);
}

onMounted(onAccept);
function onAccept() {
  Socket.socket.on("travel:accept", (data: any) => {
    if (Store.travel.current?.step === "await_driver") {
      Store.travel.pushAccept(data);

      setTimeout(() => {
        Store.travel.removeAccept(data.id);
      }, 6000);
    }
  });
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

  <div
    v-if="!Store.travel.current || Store.travel.current.step === 'define_route'"
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
      class="pg-bottom"
    >
      <div
        class="bg-background"
        v-if="Store.travel.current.step === 'define_route'"
      >
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

      <div
        v-else-if="Store.travel.current.step === 'await_driver'"
        class="bg-background"
      >
        <div
          v-for="accept in Store.travel.current.accepts || []"
          :key="accept.id"
          class="d-flex align-center pa-3 ga-2"
        >
          <v-avatar size="42">
            <v-icon size="42" icon="mdi-account-circle" />
          </v-avatar>
          <div style="line-height: 1">
            <div style="font-weight: bold">{{ "Driver Name" }}</div>
            <div class="mt-1">{{ "Car model" }} - {{ "5 min" }}</div>
          </div>

          <div class="ml-auto" style="font-weight: bold">
            <span style="opacity: 0.5">MAD</span> {{ "22" }}
          </div>

          <v-btn rounded="lg">accept</v-btn>
          <!-- {{ accept }} -->
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
.pg-bottom {
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
.pg-summary-price-input {
  .v-field {
    padding-left: 4px;
    padding-right: 4px;

    input {
      text-align: center;
      font-weight: bold;
    }
  }
}

.pg-home-marker-mobile {
  --v-theme-primary: 0, 0, 0;
}
</style>
