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
}

onMounted(listerTravel);
function listerTravel() {
  Socket.socket.on("travel:await-driver", onTravel);
}

function onTravel(travel: ITravel) {
  if (Store.app.mode !== "driver") return;
  if (!map.value) return;

  const departure = L.latLng(map.value!.getCenter()); // L.latLng(Store.position.position.current);
  const arrival = L.latLng(travel.from);

  const route = L.Routing.control({
    waypoints: [departure, arrival],
    draggableWaypoints: false,
    addWaypoints: false,
    lineOptions: {
      styles: [{ color: "#0089ff", opacity: 1, weight: 6 }],
    },
  } as any).addTo(map.value);

  route.on("routesfound", async (e) => {
    const routes = e.routes;

    if (routes.length > 0) {
      const _route = routes[0];
      travel.accepts = [
        {
          id: Math.random().toString(),
          price: travel.price,
          distance: _route.summary.totalDistance,
          time: _route.summary.totalTime,
        } as any,
      ];

      Store.travel.pushCurrents(travel);
      // map.value!.removeControl(route);
    }
  });

  // addInCurrents(data);
  // Socket.emit("travel:accept", data);
}

async function accept(travel: ITravel) {
  await Socket.emit<ITravel>("travel:accept", {
    id: travel.id,
    offer: travel.accepts[0],
  });
}
</script>

<template>
  <div style="position: absolute; width: 100%; height: 100%">
    <div
      ref="mapContainer"
      id="map"
      style="position: absolute; width: 100%; height: 100%"
    ></div>
  </div>

  <transition
    apper
    enter-active-class="animate__animated animate__slideInUp"
    leave-active-class="animate__animated animate__slideOutDown"
  >
    <div class="pg-bottom">
      <div class="bg-background">
        <div
          v-for="travel in Store.travel.currents"
          :key="travel.id"
          class="d-flex align-center pa-3 ga-2 border-b"
        >
          <v-avatar size="42">
            <v-icon size="42" icon="mdi-account-circle" />
          </v-avatar>
          <div style="line-height: 1">
            <div style="font-weight: bold">{{ "Traveler Name" }}</div>
            <div class="mt-1">
              {{ Num.formatDuration(travel.accepts[0].time) }}
            </div>
          </div>

          <div class="ml-auto" style="font-weight: bold">
            <span style="opacity: 0.5">MAD</span> {{ travel.accepts[0].price }}
          </div>

          <v-btn rounded="lg" @click="accept(travel)">accept</v-btn>
        </div>
      </div>
    </div>
  </transition>
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
