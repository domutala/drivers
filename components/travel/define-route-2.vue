<script lang="ts" setup>
import mapboxgl from "mapbox-gl";
import cNavbar from "~/components/navbar.vue";
import trvlSearchPlaces from "./search-places.vue";

const initing = ref(false);
const routing = ref(false);

const { $mapbox, $router } = useNuxtApp();
const travel = ref<{
  points: {
    [key: string]:
      | {
          marker: mapboxgl.Marker;
          meta: { name: string; place: string };
        }
      | undefined;
  };
  coordinates: [number, number][];
  distance: number;
  duration: number;
  price: { amount: number; currency: string };
  bounds: [[number, number], [number, number]];
}>({
  points: { departure: undefined, destination: undefined },
  coordinates: [],
  distance: 0,
  duration: 0,
  price: { amount: 0, currency: "MAD" },
  bounds: [] as any,
});
const pointEdit = ref<string>();
const map = ref<mapboxgl.Map>();

onMounted(async () => {
  initing.value = true;
  init();
  initing.value = false;
});

watch(
  () => Store.app.usedTheme,
  () => {
    if (!map.value) return;

    // map.value.setStyle(
    //   Store.app.usedTheme === "dark"
    //     ? "mapbox://styles/mapbox/dark-v11"
    //     : "mapbox://styles/mapbox/light-v11"
    // );
    // setTimeout(() => buildRoute(), 1000);
  }
);

async function init() {
  map.value = $mapbox.createMap({
    container: "map",
    center: Store.position.position.current,
    zoom: 16,
    // style:
    //   Store.app.usedTheme === "dark"
    //     ? "mapbox://styles/mapbox/dark-v11"
    //     : "mapbox://styles/mapbox/light-v11",
  });

  map.value.on("load", async () => {
    if (!map.value) return;

    map.value.on("drag", () => onDrag());
    // map.value.on("zoom", () => onDrag());

    map.value.on("dragend", () => onEnddrag());
    // map.value.on("zoomend", () => onEnddrag());

    await findPoint(
      {
        lat: Store.position.position.current.lat,
        lng: Store.position.position.current.lng,
      },
      setDeparture
    );

    // setTimeout(() => {
    //   const latChange = 600000 / 111000;
    //   findPoint(
    //     {
    //       lat: Store.position.position.current.lat + latChange,
    //       lng: Store.position.position.current.lng,
    //     },
    //     setDestination
    //   );
    // }, 1000);
  });
}

function onDrag() {
  if (!pointEdit.value) return;
  if (!travel.value.points[pointEdit.value]) return;
  if (!map.value) return;

  travel.value.points[pointEdit.value]?.marker.setLngLat(map.value.getCenter());
}
function onEnddrag() {
  if (!pointEdit.value) return;
  if (!travel.value.points[pointEdit.value]) return;

  findPoint(
    travel.value.points[pointEdit.value]!.marker.getLngLat(),
    pointEdit.value === "destination" ? setDestination : setDeparture
  );
}

async function findPoint(
  point: string | { lat: number; lng: number },
  callback: (point: any) => void | Promise<void>
) {
  try {
    const features =
      typeof point === "string"
        ? await $mapbox.get(point)
        : await $mapbox.lookup({ latitude: point.lat, longitude: point.lng });
    const feature = features.features[0];

    await callback({
      lat: feature.properties.coordinates.latitude,
      lng: feature.properties.coordinates.longitude,
      name: feature.properties.name_preferred,
      place: feature.properties.place_formatted,
    });
  } catch (error) {
    console.log("__catch___", error);
  }
}

function setDeparture(point: {
  lat: number;
  lng: number;
  name: string;
  place: string;
}) {
  if (!map.value) return;

  if (!travel.value.points.departure) {
    const el = $mapbox.markers.point();
    travel.value.points.departure = {
      marker: new mapboxgl.Marker({
        element: el,
      })
        .setLngLat({ lat: point.lat, lng: point.lng })
        .addTo(map.value),

      meta: { name: point.name, place: point.place },
    };
  }

  travel.value.points.departure.meta = { name: point.name, place: point.place };
  map.value.flyTo({
    animate: true,
    center: travel.value.points.departure.marker.getLngLat(),
  });
}

async function setDestination(point: {
  lat: number;
  lng: number;
  name: string;
  place: string;
}) {
  if (!map.value) return;
  if (!travel.value.points.destination) {
    const el = document.querySelector("#trvl-distantion-marker") as HTMLElement;
    travel.value.points.destination = {
      meta: { name: point.name, place: point.place },
      marker: new mapboxgl.Marker({ element: el, anchor: "bottom" })
        .setLngLat({ lat: point.lat, lng: point.lng })
        .addTo(map.value)
        .on("dragend", () => {
          findPoint(
            travel.value.points.destination!.marker.getLngLat(),
            setDestination
          );
        }),
    };
  }

  travel.value.points.destination.meta = {
    name: point.name,
    place: point.place,
  };
  map.value.flyTo({
    animate: true,
    center: travel.value.points.destination.marker.getLngLat(),
  });
  buildRoute();
}

async function buildRoute() {
  if (!map.value) return;
  if (!travel.value.points.destination) return;
  if (!travel.value.points.departure) return;

  routing.value = true;

  try {
    const routes = await $mapbox.route({
      departure: travel.value.points.departure.marker.getLngLat(),
      destination: travel.value.points.destination.marker.getLngLat(),
    });

    if (map.value.getLayer("line")) map.value.removeLayer("line");
    if (map.value.getSource("line")) map.value.removeSource("line");

    map.value.addSource("line", {
      type: "geojson",
      lineMetrics: true,
      data: routes[0].geojson as any,
    });
    map.value.addLayer({
      type: "line",
      source: "line",
      id: "line",
      paint: { "line-color": "#1fff62", "line-width": 4 },
      layout: { "line-cap": "round", "line-join": "round" },
    });

    travel.value.coordinates = routes[0].meta.coordinates;
    travel.value.distance = routes[0].meta.distance;
    travel.value.duration = routes[0].meta.duration;
    travel.value.price = routes[0].meta.price;
    travel.value.bounds = routes[0].meta.bounds;
  } finally {
    routing.value = false;
  }
}

watch(() => pointEdit.value, onPointEdit);
async function onPointEdit() {
  if (!map.value) return;

  if (!pointEdit.value) {
    if (travel.value.bounds.length) {
      map.value.fitBounds(travel.value.bounds, { padding: 100 });
    }
    return;
  }

  if (!travel.value.points[pointEdit.value]) {
    if (pointEdit.value === "departure") {
      await findPoint(
        {
          lat: Store.position.position.current.lat,
          lng: Store.position.position.current.lng,
        },
        setDeparture
      );
    } else {
    }
  }

  if (travel.value.points[pointEdit.value]) {
    map.value.flyTo({
      animate: true,
      center: travel.value.points[pointEdit.value]!.marker.getLngLat(),
      zoom: 15,
    });
  }
}

function onPlace(mapbox_id: string) {
  if (!pointEdit.value) return;
  findPoint(
    mapbox_id,
    pointEdit.value === "departure" ? setDeparture : setDestination
  );
}
</script>

<template>
  <v-app>
    <c-navbar />

    <div id="map"></div>

    <div class="trvl-search-places-bottom">
      <!-- <transition
        apper
        enter-active-class="animate__animated animate__slideInUp"
        leave-active-class="animate__animated animate__slideOutDown"
      >
        <div
          v-if="travel.coordinates.length"
          class="trvl-search-places--details bg-green"
          style="animation-duration: 0.25s"
        >
          <div
            class="px-5 py-2 d-flex align-center justify-center ga-2"
            style="font-size: 12px"
          >
            <i class="fi fi-rr-route text-black"></i>
            {{ Num.formatDistance(travel.distance) }}

            <div class="mx-2 text-center">-</div>

            <i class="fi fi-rr-stopwatch text-black"></i>
            {{ Num.formatDuration(travel.duration) }}
          </div>
        </div>
      </transition> -->

      <div class="trvl-search-places--input bg-background">
        <v-list-item
          v-for="(point, p) in travel.points"
          :key="p"
          class="w-100 py-4 rounded-pill"
          style="cursor: pointer"
          @click="
            pointEdit = p as string;
            $router.push({ query: { search: 'open' } });
          "
          v-show="!pointEdit || pointEdit === p"
        >
          <template #prepend>
            <i
              class="fi fi-rr-marker mr-3"
              :class="{
                'text-green': p === 'departure',
                'text-red': p === 'destination',
              }"
            ></i>
          </template>

          <template #title>
            <div v-if="point" style="line-height: 1">
              <div style="font-size: 16px; padding: 0">
                {{ point.meta.name || "Route sans nom" }}
              </div>
              <div style="font-size: 80%; padding: 0; opacity: 0.5">
                {{ point.meta.place }}
              </div>
            </div>
            <div v-else style="line-height: 1">
              <div style="font-size: 16px; padding: 0">
                {{ p }}
              </div>
              <div style="font-size: 80%; padding: 0; opacity: 0.5">
                Cliquer pout modifier
              </div>
            </div>
          </template>
        </v-list-item>

        <div class="mt-3 w-100 d-flex align-center justify-center">
          <v-btn
            v-if="pointEdit"
            :disabled="!travel.points[pointEdit]"
            :loading="routing"
            color="primary"
            rounded="pill"
            size="x-large"
            @click.stop="pointEdit = undefined"
          >
            <template #loader>
              <div>
                <v-progress-linear
                  indeterminate
                  :height="12"
                  rounded
                  rounded-bar
                  stream
                  striped
                  color="dark"
                  bg-color="light *-*"
                  style="width: 80px"
                />
              </div>
            </template>
            Terminer
          </v-btn>
          <v-btn
            v-else-if="travel.distance"
            color="primary"
            rounded="pill"
            size="x-large"
          >
            Trouver un conducteur
          </v-btn>
        </div>
      </div>
    </div>

    <div id="trvl-distantion-marker">
      <div
        class="bg-white d-flex ga-2 align-center justify-center"
        style="
          width: max-content;
          border-radius: 0.7em;
          position: relative;
          padding: 5px;
          box-shadow: rgba(50, 50, 93, 0.25) 0px 30px 60px -12px,
            rgba(0, 0, 0, 0.3) 0px 18px 36px -18px;
        "
      >
        <svg-icon
          style="
            position: absolute;
            width: 100%;
            height: 100%;
            max-width: 63px;
            bottom: -35px;
            left: 50%;
            transform: translateX(-50%);
          "
          name="map-spin"
          class="text-white"
        />
        <div
          class="bg-primary"
          style="
            border-radius: 0.5em;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 92px;
          "
        >
          <div
            v-if="routing"
            style="
              width: 110px;
              height: 80px;
              display: flex;
              align-items: center;
              position: relative;
            "
          >
            <v-progress-linear
              indeterminate
              :height="12"
              rounded
              rounded-bar
              stream
              striped
              color="dark"
              bg-color="light *-*"
              style="width: 80px"
            />

            <!-- <v-progress-circular indeterminate size="22" /> -->
          </div>
          <div
            v-else-if="travel.coordinates.length"
            style="min-width: 110px"
            @click="pointEdit = 'destination'"
          >
            <div class="d-flex align-center ga-3 px-3 py-1">
              <i class="fi fi-rr-stopwatch" style="opacity: 0.7"></i>
              {{ Num.formatDuration(travel.duration) }}
            </div>
            <div class="d-flex align-center ga-3 px-3 py-1 border-t">
              <i class="fi fi-rr-route" style="opacity: 0.7"></i>
              {{ Num.formatDistance(travel.distance) }}
            </div>
            <div class="d-flex align-center ga-3 px-3 py-1 border-t">
              <i class="fi fi-rr-ticket" style="opacity: 0.7"></i>
              {{ travel.price.amount }}
              {{ travel.price.currency }}
            </div>
          </div>
          <div
            v-else
            style="
              width: 110px;
              height: 80px;
              display: flex;
              align-items: center;
              justify-content: center;
            "
          >
            <v-icon size="56" icon="mdi-account-circle" />
          </div>
        </div>
      </div>
      <div style="height: 19px"></div>
    </div>

    <trvl-search-places
      v-if="$route.query.search === 'open'"
      @place="(v) => onPlace(v)"
    />
  </v-app>
</template>

<style lang="scss">
#trvl-distantion-marker:not(.mapboxgl-marker) {
  display: none !important;
}

.trvl-search-places-bottom {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 600px;

  @media (min-width: 662px) {
    bottom: 20px;
  }
}

.trvl-search-places--details {
  position: relative;
  border-top-right-radius: 1.9em;
  border-top-left-radius: 1.9em;
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;

  &::before {
    content: "";
    background-color: inherit;
    height: 50px;
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
  }
}

.trvl-search-places--input {
  padding: 20px;
  min-height: 120px;
  border-top-right-radius: 1.9em;
  border-top-left-radius: 1.9em;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  // gap: 15px;
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
  position: relative;

  // &::before {
  //   content: "";
  //   position: absolute;
  //   top: 0;
  //   left: 0;
  //   width: 100%;
  //   height: 100%;
  //   box-shadow: rgb(51, 51, 51, 0.5) 0px 0px 0px 1px;
  //   border-radius: inherit;
  // }

  @media (min-width: 662px) {
    border-radius: 1.9em;
  }
}
</style>
