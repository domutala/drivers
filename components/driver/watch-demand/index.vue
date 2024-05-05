<script lang="ts" setup>
import mapboxgl from "mapbox-gl";
import cDemand from "./demand.vue";
import type { ITravel } from "~/models/Travel";

const { $mapbox } = useNuxtApp();
const map = ref<mapboxgl.Map>();
const mapContainer = ref<HTMLDivElement>();
const position = ref<mapboxgl.Marker>();

onMounted(search)
async function search() {
  Socket.socket.on('travel:traveller-accept-driver', onTravellerAcceptOffer)
  try {
    const travels = await Socket.emit<ITravel[]>('travel:search-traveller');
    Store.driver.push(travels)
  } finally {
    setTimeout(search, 1000);
  }
}

onMounted(init);
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

function onTravellerAcceptOffer(travel: ITravel) {
  if (travel.id === Store.driver.accept?.travel.id) {
    Store.driver.setCurrent(travel)
  }
}

onBeforeUnmount(destroy);
onDeactivated(destroy);
function destroy() {
  Socket.socket.off('travel:traveller-accept-driver', onTravellerAcceptOffer)
}
</script>

<template>
  <div ref="mapContainer"></div>
  <div class="drvr-watch-demand--body">
    <div v-if="Store.driver.accept" class="drvr-watch-demand--bottom">
      <div class="bg-background pa-5 text-center">
        <v-progress-circular indeterminate rounded rounded-bar stream striped color="primary" />
        En attente de l'acceptation de Mamadou
      </div>
    </div>

    <div v-else class="drvr-watch-demand--bottom">
      <div class="drvr-watch-demand--watcher d-flex align-center justify-center mb-3">
        <v-chip v-if="!Store.driver.accept" color="black" variant="flat" elevation="5" class="">
          <v-progress-linear indeterminate :height="12" rounded rounded-bar stream striped color="white"
            bg-color="white" style="width: 80px" />

          <!-- En attente de demande -->
        </v-chip>
      </div>

      <div class="bg-background drvr-watch-demand--empty">
        <c-demand v-for="travel in Store.driver.travels" :key="travel.id" :travel="travel" />

        <div v-if="!Store.driver.travels.length" class="py-5 text-center mx-auto" style="max-width: 220px">
          Aucune demande dans cette zone pour le moment.
        </div>
      </div>
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

    >div:not(.drvr-watch-demand--watcher) {
      border-top-right-radius: 1.9em;
      border-top-left-radius: 1.9em;
      box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;

      @media (min-width: 662px) {
        border-radius: 1.9em;
      }
    }
  }



  .drvr-watch-demand--empty {
    max-height: 70lvh;
    overflow: auto;
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
