<script lang="ts" setup>
import L from "leaflet";
import type { ITravel } from "~/models/Travel";
import cSearchPlaces from "./search-places.vue";

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
const hideDetails = ref(false);
const isNavigationTooltipOpen = ref(false);
const myPrice = ref(0);

onMounted(mounted);
function mounted() {
  curentPositionMarker.value = L.marker(Store.position.position.current!, {
    draggable: false,
    opacity: 0,
    icon: L.divIcon({
      html: $map.icons.point2,
      className: "",
      iconSize: [50, 50],
    }),
  }).addTo(props.map);

  marker.value = L.marker(Store.position.position.current, {
    draggable: false,
    opacity: 1,
    icon: L.divIcon({
      html: $map.icons.spin2,
      className: "pg-travel--define-route__home-marker-mobile",
      iconSize: [50, 50],
      iconAnchor: [25, 50],
    }),
  }).addTo(props.map);
  if (Store.travel.current) {
    marker.value.setLatLng(Store.travel.current.to);
    marker.value.setOpacity(0);
  }

  props.map.on("dragstart", () => marker.value!.setOpacity(1));
  props.map.on("zoomstart", () => marker.value!.setOpacity(1));

  props.map.on("dragend", () => marker.value!.setOpacity(0));
  props.map.on("zoomend", () => marker.value!.setOpacity(0));

  props.map.on("dragstart", () => (hideBottom.value = true));
  props.map.on("dragend", () => (hideBottom.value = false));

  props.map.on("drag", () => marker.value!.setLatLng(props.map!.getCenter()));

  props.map.on("zoomstart", () => destroyRoute());
  props.map.on("dragstart", () => destroyRoute());

  props.map.on("zoomend", () => initRoute());
  props.map.on("dragend", () => initRoute());

  if (Store.travel.current) {
    Store.travel.cleanAccept();
    initRoute(Store.travel.current.to);
  }
}

function toCenter() {
  const to = route.value
    ? route.value.getWaypoints()[route.value.getWaypoints().length - 1].latLng
    : Store.position.position.current;

  props.map.setView(to, 16);
}

function showRoute() {
  if (!route.value) return;

  const waypoints = route.value.getWaypoints();
  const bounds = waypoints.reduce(function (bounds, waypoint) {
    return bounds.extend(waypoint.latLng);
  }, L.latLngBounds(
    route.value.getWaypoints()[0].latLng,
    waypoints[waypoints.length - 1].latLng
  ));

  props.map.fitBounds(bounds.pad(1));
  hideDetails.value = true;
}

function initRoute(to?: L.LatLngLiteral) {
  if (!props.map) return;
  if (!marker.value) return;

  props.map.setView(marker.value!.getLatLng(), props.map.getZoom(), {
    duration: 5000,
  });
  setTimeout(() => {
    if (!route.value) {
      const departure = L.latLng(Store.position.position.current);
      const arrival = L.latLng(to || props.map.getCenter());

      route.value = L.Routing.control({
        waypoints: [departure, arrival],
        draggableWaypoints: false,
        addWaypoints: false,
        useZoomParameter: false,
        fitSelectedRoutes: false,
        lineOptions: {
          styles: [
            { color: "rgb(var(--v-theme-primary))", opacity: 1, weight: 6 },
          ],
        },
        // showAlternatives: true,
        // altLineOptions: {
        //   styles: [{ color: "#0089ff", opacity: 0.4, weight: 6 }],
        // },
        createMarker: function (i: number, waypoint: any, n: number) {
          const icon = `
        <div
        style="--v-theme-primary: var(--v-theme-${
          i === 0 ? "success" : "error"
        });"
        >
          ${$map.icons.point2}
        </div>`;
          // ${i === 1 ? $map.icons.point : $map.icons.point}

          const svgIcon = L.divIcon({
            html: icon,
            className: "",
            // iconAnchor: i === 1 ? [24, 48] : undefined,
            iconSize: [42, 42], // i === 0 ? [24, 24] : [48, 48],
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
      route.value.on("routesfound", async (e) => {
        const routes = e.routes;

        if (routes.length > 0) {
          const route = routes[0];
          init({
            distance: route.summary.totalDistance,
            time: route.summary.totalTime,
            from: route.waypoints[0].latLng,
            to: route.waypoints[route.waypoints.length - 1].latLng,
            price: undefined,
          });
        }
      });
    }

    updateWaypoint(to);
  }, 500);
}

function destroyRoute() {
  if (!route.value) return;
  route.value.remove();
  route.value = undefined;
  marker.value!.setOpacity(1);
}

async function init(_travel: Partial<ITravel>) {
  initing.value = true;

  try {
    const travel = await Socket.emit<ITravel>("travel:init", {
      ...(Store.travel.current || {}),
      ..._travel,
    });

    Store.travel.setCurrent(travel);
  } finally {
    initing.value = false;
  }
}

function updateWaypoint(to?: L.LatLngLiteral) {
  if (!marker.value) return;
  if (!route.value) return;
  if (!props.map) return;

  const departure = L.latLng(Store.position.position.current);
  const arrival = L.latLng(
    to || marker.value.getLatLng()
    /* props.map.getCenter()*/
  );

  route.value.setWaypoints([departure, arrival]);
  hideDetails.value = false;
}

async function findDriver() {
  if (!Store.travel.current) return;

  const travel = await Socket.emit<ITravel>(
    "travel:search-driver",
    Store.travel.current
  );

  Store.travel.setCurrent(travel);
}

function takePlace(place: any) {
  if (!marker.value) return;
  marker.value.setLatLng({ lat: place.lat, lng: place.lon });
  initRoute();
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

  props.map.removeEventListener("drag");
  props.map.removeEventListener("dragstart");
  props.map.removeEventListener("dragend");
  props.map.removeEventListener("zoom");
  props.map.removeEventListener("zoomstart");
  props.map.removeEventListener("zoomend");
}
</script>

<template>
  <transition
    apper
    enter-active-class="animate__animated animate__slideInUp"
    leave-active-class="animate__animated animate__slideOutDown"
  >
    <div
      v-show="!initing && !routing && !hideBottom"
      class="pg-travel--define-route__bottom"
    >
      <div
        v-if="hideDetails && route"
        style="
          position: absolute;
          bottom: calc(100% + 10px);
          left: 50%;
          transform: translateX(-50%);
          pointer-events: auto;
        "
      >
        <v-btn
          icon
          size="32"
          class="elevation-1"
          color="primary"
          @click="hideDetails = false"
        >
          <i class="fi fi-rr-angle-up"></i>
        </v-btn>
      </div>
      <div class="content">
        <transition
          enter-active-class="animate__animated animate__slideInUp"
          leave-active-class="animate__animated animate__slideOutDown"
        >
          <div
            v-if="
              Store.travel.current && !isNavigationTooltipOpen && !hideDetails
            "
            class="border-b bg-background"
            style="animation-duration: 0.25s"
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
                  <v-dialog max-width="500">
                    <template v-slot:activator="{ props: activatorProps }">
                      <div
                        class="text-h2 font-weight-bold d-flex ga-2"
                        v-bind="activatorProps"
                        @click="()=> {
                      myPrice = Store.travel.current!.price;
                     }"
                      >
                        <span style="opacity: 0.3">
                          MAD
                          <!-- {{ Store.app.currency }} -->
                        </span>
                        <span>{{ Store.travel.current.price }}</span>
                      </div>
                    </template>

                    <template v-slot:default="{ isActive }">
                      <v-card>
                        <v-card-text class="pa-0">
                          <v-text-field
                            autofocus
                            variant="outlined"
                            class="pg-travel--define-update-price"
                            hide-details
                            v-model="myPrice"
                            type="number"
                            @keypress.enter="
                              isActive.value = false;
                              init({ price: parseInt(myPrice.toString()) });
                            "
                          >
                            <template #prepend-inner>
                              <div style="opacity: 0.5">MAD</div>
                            </template>
                            <template v-if="myPrice" #append-inner>
                              <v-btn
                                text="ok"
                                rounded="pill"
                                size="small"
                                icon
                                @click="
                                  isActive.value = false;
                                  init({ price: parseInt(myPrice.toString()) });
                                "
                              ></v-btn>
                            </template>
                          </v-text-field>
                        </v-card-text>
                      </v-card>
                    </template>
                  </v-dialog>
                </div>
                <div class="text-center">Vous pouvez proposer un prix</div>
              </div>

              <div class="d-flex justify-center mt-5">
                <v-btn rounded="pill" size="large" @click="findDriver">
                  Trouver un conducteur
                </v-btn>
              </div>
            </div>
          </div>
        </transition>

        <div
          class="px-7 py-5 bg-background"
          style="z-index: 10; position: relative"
        >
          <div
            class="rounded-pill bg-background border pa-1 d-flex align-center ga-2"
            @click="$router.push({ query: { search: 'open' } })"
          >
            <div style="font-size: 24px; opacity: 0.5; margin-left: 10px">
              <i class="fi fi-rr-marker"></i>
            </div>

            <div v-if="Store.travel.current">
              <v-banner
                lines="one"
                bg-color="transparent"
                class="border-0"
                style="font-size: 16px; padding: 0"
                :text="Store.travel.current.to.name || 'Route sans nom'"
                :stacked="false"
              ></v-banner>
            </div>
            <div v-else style="opacity: 0.5; user-select: none">
              Ou allez-vous ?
            </div>

            <v-spacer />

            <v-btn v-if="!route" icon @click="toCenter()" variant="tonal">
              <i
                class="fi fi-rr-location-crosshairs"
                style="font-size: 22px"
              ></i>
            </v-btn>

            <v-tooltip
              v-else
              location="top center"
              content-class="bg-transparent"
              offset="25px"
              v-model="isNavigationTooltipOpen"
              :open-on-hover="false"
              open-on-click
              close-on-back
            >
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" icon variant="tonal">
                  <i
                    class="fi fi-br-location-arrow"
                    style="font-size: 22px"
                  ></i>
                </v-btn>
              </template>

              <template #default>
                <div
                  class="d-flex flex-column ga-2"
                  style="pointer-events: auto"
                >
                  <div style="position: relative">
                    <v-btn
                      icon
                      @click="
                        isNavigationTooltipOpen = false;
                        toCenter();
                      "
                      color="black"
                      border
                    >
                      <i class="fi fi-rr-location-crosshairs"></i>
                    </v-btn>
                  </div>

                  <div style="position: relative">
                    <v-btn
                      icon
                      color="black"
                      border
                      @click="
                        isNavigationTooltipOpen = false;
                        showRoute();
                      "
                    >
                      <i class="fi fi-rr-route"></i>
                    </v-btn>

                    <div
                      style="
                        position: absolute;
                        top: 50%;
                        right: calc(100% + 5px);
                        transform: translateY(-50%);
                        width: max-content;
                      "
                      class="bg-black rounded-pill px-3 py-1 border"
                    >
                      Voir le trajet
                    </div>
                  </div>
                </div>
              </template>
            </v-tooltip>
          </div>
        </div>
      </div>
    </div>
  </transition>

  <div
    v-if="initing || routing"
    style="position: fixed; bottom: 0; right: 0; z-index: 20000; width: 100%"
  >
    {{ initing }} {{ routing }}
    <v-progress-linear
      indeterminate
      :height="6"
      color="primary"
      bg-color="light"
    />
  </div>

  <c-search-places v-if="$route.query.search === 'open'" @place="takePlace" />
</template>

<style lang="scss" scoped>
.pg-travel--define-route__bottom {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  z-index: 500;
  animation-duration: 0.25s;
  pointer-events: none;

  > .content {
    pointer-events: auto;
    box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
    margin: auto;
    margin-bottom: 0px;
    width: 500px;
    max-width: 100%;
    overflow: hidden;
    border-top-right-radius: 1.9em;
    border-top-left-radius: 1.9em;

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
.pg-travel--define-route__search-opener .v-field.v-field--appended {
  padding-left: 5px;
  padding-right: 5px;
}

.pg-travel--define-update-price {
  .v-field {
    font-size: 42px;
    font-weight: bold;

    .v-field__outline {
      --v-field-border-width: 0 !important;
    }

    input {
      font-weight: bold;
    }
  }
}
</style>
./search-places.vue
