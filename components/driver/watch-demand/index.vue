<script lang="ts" setup>
import mapboxgl from "mapbox-gl";
import cDemand from "./demand.vue";

const { $mapbox, $router } = useNuxtApp();
const map = ref<mapboxgl.Map>();
const mapContainer = ref<HTMLDivElement>();
const initing = ref(false);
const position = ref<mapboxgl.Marker>();

onMounted(async () => {
  initing.value = true;
  init();
  initing.value = false;
});

async function init() {
  if (!mapContainer.value) return;

  map.value = $mapbox.createMap({
    container: mapContainer.value,
    center: Store.position.position.current,
    zoom: 16,
  });

  map.value.on("load", async () => {
    setPosition();
  });
}
watch(() => Store.position.position.current, setPosition, { deep: true });

function setPosition() {
  if (!map.value) return;
  if (!position.value) {
    position.value = new mapboxgl.Marker({ element: $mapbox.markers.radar() })
      .setLngLat(Store.position.position.current)
      .addTo(map.value);
  }

  position.value.setLngLat(Store.position.position.current);
  map.value.flyTo({
    animate: true,
    center: position.value.getLngLat(),
    duration: 1200,
  });
}
</script>

<template>
  <div ref="mapContainer"></div>
  <div class="drvr-watch-demand--body">
    <div
      :style="{ marginTop: `${Store.app.statusBar.height + 20}px` }"
      class="drvr-watch-demand--head d-flex align-center justify-center"
    >
      <v-chip color="black" variant="flat" elevation="5">
        En attente de demande
      </v-chip>
    </div>

    <div class="drvr-watch-demand--bottom">
      <div class="bg-background drvr-watch-demand--empty">
        <c-demand v-for="i in 1" :key="i" />
      </div>

      <!-- <div class="bg-background drvr-watch-demand--empty">
        <div class="pb-2 pt-7 text-center mx-auto" style="max-width: 220px">
          Aucune demande dans cette zone pour le moment.
          <v-progress-linear
            indeterminate
            :height="12"
            rounded
            rounded-bar
            stream
            striped
            color="dark"
            bg-color="light"
            class="mt-3"
            style="width: 80px"
          />
        </div>
      </div> -->
    </div>
  </div>
</template>

<style lang="scss">
.drvr-watch-demand--body {
  position: relative;

  .drvr-watch-demand--bottom {
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

  .drvr-watch-demand--empty {
    border-top-right-radius: 1.9em;
    border-top-left-radius: 1.9em;
    box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
    max-height: 70lvh;
    overflow: auto;

    @media (min-width: 662px) {
      border-radius: 1.9em;
    }
  }

  .drvr-watch-demand--empty {
    .v-progress-linear {
      .v-progress-linear__indeterminate {
        display: none;
      }
    }
  }
}
</style>
