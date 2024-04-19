<script lang="ts" setup>
import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "@maptiler/leaflet-maptilersdk";
import "leaflet-routing-machine";
const { $map } = useNuxtApp();

const mapContainer = ref<HTMLElement>();
const marker = ref<L.Marker>();

const map = ref<L.Map>();
const route = ref();

onMounted(mounted);
function mounted() {
  if (!mapContainer.value) return;
  map.value = $map.init(mapContainer.value);

  const point = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512.002 512.002" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><circle cx="256.001" cy="256.001" r="200" style="fill-rule:evenodd;clip-rule:evenodd;" transform="rotate(-45.001 256 256.005)"></circle><circle cx="256.001" cy="256.001" r="246.001" style="fill-rule:evenodd;clip-rule:evenodd;stroke-width:20.0001;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:22.9256;" transform="rotate(-45.001 256 256.005)" fill-rule="evenodd" clip-rule="evenodd" fill="none" stroke="#000" stroke-width="20.0001" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="22.9256"></circle></g></svg>`;

  L.marker(Store.position.position.current!, {
    draggable: false,
    icon: L.divIcon({
      html: $map.icons.point,
      className: "",
      iconSize: [24, 24],
    }),
  }).addTo(map.value);

  marker.value = L.marker(Store.position.position.current!, {
    draggable: false,
    icon: L.divIcon({
      html: $map.icons.spin,
      className: "",
      iconSize: [48, 48],
      iconAnchor: [24, 48],
    }),
  }).addTo(map.value);

  map.value.on("drag", () => {
    marker.value!.setLatLng(map.value!.getCenter());
  });
}

function toCenter() {
  if (!map.value) return;
  if (!marker.value) return;

  map.value.setView(Store.position.position.current!);
  marker.value.setLatLng(Store.position.position.current!);
}

function updateRoute() {
  if (!map.value) return;

  if (route.value) map.value.removeControl(route.value);

  const departure = L.latLng(
    {
      lat: 51.5,
      lng: -0.09,
      icon: L.divIcon({
        className: "custom-marker",
        html: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="green" stroke="red" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="16" cy="16" r="10" /></svg>`,
      }),
    },
    {
      icon: L.divIcon({
        className: "custom-marker",
        html: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="green" stroke="red" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="16" cy="16" r="10" /></svg>`,
      }),
    }
  );
  const arrival = L.latLng({ lat: 51.51, lng: -0.1 });

  route.value = L.Routing.control({
    waypoints: [departure, arrival],
    draggableWaypoints: false,
    showAlternatives: true,
    addWaypoints: false,
    lineOptions: {
      styles: [{ color: "#0089ff", opacity: 1, weight: 6 }],
    },
    altLineOptions: {
      styles: [{ color: "#0089ff", opacity: 0.4, weight: 6 }],
    },
    createMarker: function (i: number, waypoint: any, n: number) {
      const icons = {
        point: `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512.002 512.002" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><circle cx="256.001" cy="256.001" r="200" style="fill-rule:evenodd;clip-rule:evenodd;" transform="rotate(-45.001 256 256.005)"></circle><circle cx="256.001" cy="256.001" r="246.001" style="fill-rule:evenodd;clip-rule:evenodd;stroke-width:20.0001;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:22.9256;" transform="rotate(-45.001 256 256.005)" fill-rule="evenodd" clip-rule="evenodd" fill="none" stroke="#000" stroke-width="20.0001" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="22.9256"></circle></g></svg>`,

        car: `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><g data-name="13-car"><path d="M120 236a52 52 0 1 0 52 52 52.059 52.059 0 0 0-52-52Zm0 76a24 24 0 1 1 24-24 24 24 0 0 1-24 24ZM408 236a52 52 0 1 0 52 52 52.059 52.059 0 0 0-52-52Zm0 76a24 24 0 1 1 24-24 24 24 0 0 1-24 24Z" ></path><path d="M477.4 193.04 384 176l-79.515-65.975A44.109 44.109 0 0 0 276.526 100H159.38a43.785 43.785 0 0 0-34.359 16.514L74.232 176H40a36.04 36.04 0 0 0-36 36v44a44.049 44.049 0 0 0 44 44h9.145a64 64 0 1 1 125.71 0h162.29a64 64 0 1 1 125.71 0H472a36.04 36.04 0 0 0 36-36v-35.368a35.791 35.791 0 0 0-30.6-35.592ZM180 164a12 12 0 0 1-12 12h-52.755a6 6 0 0 1-4.563-9.9l34.916-40.9a12 12 0 0 1 9.126-4.2H168a12 12 0 0 1 12 12Zm60 56h-16a12 12 0 0 1 0-24h16a12 12 0 0 1 0 24Zm94.479-43.706-114.507-.266a12 12 0 0 1-11.972-12V133a12 12 0 0 1 12-12h57.548a12 12 0 0 1 7.433 2.58l53.228 42a6 6 0 0 1-3.73 10.714Z" ></path></g></g></svg>`,
      };

      const svgIcon = L.divIcon({
        html: i === 0 ? icons.car : icons.point,
        className: "",
        iconSize: i === 0 ? [42, 54] : [24, 24],
        iconAnchor: [0, 0],
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
  }).addTo(map.value);
}

function updateWaypoint(waypoints: { lat: 51.5; lng: -0.09 }[]) {
  if (!route.value) return;

  const departure = waypoints[0]
    ? L.latLng(waypoints[0])
    : route.value.options.waypoints[0];
  const arrival = waypoints[1]
    ? L.latLng(waypoints[1])
    : route.value.options.waypoints[1];

  route.value.setWaypoints([departure, arrival]);
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

  <!-- <div
    style="
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
      user-select: none;
      cursor: pointer;
      width: 500px;
      max-width: 90%;
    "
    class="bg-background border rounded-pill pa-3 d-flex align-center"
  >
    <div style="opacity: 0.3">
      Lorem ipsum dolor sit amet consectetur adipisicing elit.
    </div>
  </div> -->

  <div style="position: fixed; bottom: 20px; right: 50px; z-index: 1000">
    <v-btn size="small" icon @click="toCenter">*</v-btn>
  </div>
</template>

<style lang="scss">
body {
  margin: 0;
}

.leaflet-control-attribution {
  display: none;
}

[href="https://www.maptiler.com"]
{
  display: none;
}

.leaflet-routing-container {
  display: none;
}
</style>
