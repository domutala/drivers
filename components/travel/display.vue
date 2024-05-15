<script lang="ts" setup>
import mapboxgl from "mapbox-gl";
import type { ITravel } from "~/models/Travel";

const { $mapbox } = useNuxtApp();
const map = ref<mapboxgl.Map>();
const mapContainer = ref<HTMLDivElement>();
const travel = ref<ITravel>();

onMounted(init);
async function init() {
  travel.value = Store.traveller.travels[5];

  setTimeout(() => {
    if (!travel.value) return;
    if (!mapContainer.value) return;
    console.log(travel.value);

    map.value = $mapbox
      .createMap({
        container: mapContainer.value,
        center: Store.position.position.current,
        zoom: 16,
      })
      .on("style.load", async () => {
        if (!map.value) return;
        if (!travel.value) return;

        const routes = await $mapbox.route({
          departure: travel.value.from,
          destination: travel.value.to,
        });

        console.log(routes[0].geojson, {
          type: "FeatureCollection",
          features: [
            {
              properties: {},
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates: [travel.value.from, travel.value.to],
              },
            },
          ],
        });

        map.value.addLayer({
          id: "route",
          type: "line",
          source: {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: [travel.value.from, travel.value.to],
              },
            },
          },
          paint: { "line-color": "#1fff62", "line-width": 4 },
          layout: { "line-cap": "round", "line-join": "round" },
        });

        new mapboxgl.Marker({
          draggable: false,
          color: "red",
        })
          .setPopup(
            new mapboxgl.Popup({
              closeButton: false,
              className: "mapbox-marker-point-with-popup",
              closeOnClick: false,
            }).setHTML(
              `
          <div class="d-flex align-center justify-center ga-2 bg-black">
            <i class="fi fi-rr-marker text-red"></i>
            <div style="
              text-overflow: ellipsis;
              max-width: 76px;
              overflow: hidden;
              white-space: nowrap;
            ">
              ${travel.value.from.name || "Route sans nom"}
            </div>
          </div>
        `
            )
          )
          .setLngLat(travel.value.from)
          .addTo(map.value)
          .togglePopup();

        new mapboxgl.Marker({
          draggable: false,
          color: "green",
        })
          .setPopup(
            new mapboxgl.Popup({
              closeButton: false,
              className: "mapbox-marker-point-with-popup",
              closeOnClick: false,
            }).setHTML(
              `
          <div class="d-flex align-center justify-center ga-2 bg-black">
            <i class="fi fi-rr-marker text-green"></i>
            <div style="
              text-overflow: ellipsis;
              max-width: 76px;
              overflow: hidden;
              white-space: nowrap;
            ">
              ${travel.value.to.name || "Route sans nom"}
            </div>
          </div>
        `
            )
          )
          .setLngLat(travel.value.to)
          .addTo(map.value)
          .togglePopup();

        map.value.fitBounds(routes[0].meta.bounds, { padding: 80 });
      });
  }, 100);
}
</script>

<template>
  <div v-if="travel" class="h-screen d-flex flex-column">
    <div
      class="bg-background pb-1"
      style="position: sticky; width: 100%; top: 0; z-index: 560"
      :style="{
        paddingTop: `${Store.app.statusBar.height + 5}px`,
      }"
    >
      <div
        style="height: 60px"
        class="bg-background rounded-pill d-flex align-center px-1 mx-2 ga-2"
      >
        <v-btn
          icon
          color="dark"
          variant="tonal"
          size="32"
          @click="Store.traveller.setCurrent()"
        >
          <i class="fi fi-br-cross-small"></i>
        </v-btn>
      </div>
    </div>

    <div style="position: relative; width: 100%">
      <div
        ref="mapContainer"
        style="position: relative; width: 100%; height: 350px"
      ></div>
      <div
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%"
      ></div>
    </div>

    <div style="padding-bottom: 60px">lorem</div>

    <div
      style="
        position: fixed;
        bottom: 0;
        width: 100%;
        z-index: 10;
        box-shadow: rgba(var(--v-theme-on-background), 0.1) 0px 1px 15px;
      "
      class="bg-background d-flex flex-column justify-center align-center"
    >
      <div class="d-flex align-center justify-center ga-5 py-4">
        <div class="d-flex align-center ga-1">
          <i class="fi fi-rr-route"></i>
          {{ Num.formatDistance(travel.distance) }}
        </div>

        <div class="d-flex align-center ga-1">
          <i class="fi fi-rr-stopwatch"></i>
          {{ Num.formatDuration(travel.duration) }}
        </div>

        <div class="d-flex align-center ga-1">
          <i class="fi fi-rs-ticket"></i>
          {{ travel.price.amount }}
          {{ travel.price.currency }}
        </div>
      </div>
    </div>
  </div>
</template>
