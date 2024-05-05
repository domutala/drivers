<script lang="ts" setup>
import mapboxgl from 'mapbox-gl';
import cOffer from "./offer.vue";
import type { ITravel, ITravel2 } from '~/models/Travel';

const { $mapbox, $vuetify } = useNuxtApp();
const map = ref<mapboxgl.Map>();
const mapContainer = ref<HTMLDivElement>();
const myPrice = ref(0)
const showUpdatePrice = ref(false)
const showUpdatePriceInfo = ref(false)
const searching = ref(false)
const offers = ref<{ price: number, id: string, duration: number, key: string }[]>([])


onMounted(init);
async function init() {
  if (!mapContainer.value) return;

  map.value = $mapbox.createMap({
    container: mapContainer.value,
    center: Store.position.position.current,
    zoom: 16,
  }).on("style.load", async () => {
    if (!map.value) return;
    if (!Store.traveller.current) return;

    const routes = await $mapbox.route({
      departure: Store.traveller.current.from,
      destination: Store.traveller.current.to,
    });

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


    new mapboxgl.Marker({
      draggable: false,
      color: "red",
    })
      .setPopup(new mapboxgl.Popup({
        closeButton: false,
        className: "mapbox-marker-point-with-popup",
        closeOnClick: false,
      })
        .setHTML(
          `
          <div class="d-flex align-center justify-center ga-2 bg-black">
            <i class="fi fi-rr-marker text-red"></i>
            <div style="
              text-overflow: ellipsis;
              max-width: 76px;
              overflow: hidden;
              white-space: nowrap;
            ">
              ${Store.traveller.current.from.name || "Route sans nom"}
            </div>
          </div>
        `
        )
      )
      .setLngLat(Store.traveller.current.from)
      .addTo(map.value)
      .togglePopup()


    new mapboxgl.Marker({
      draggable: false,
      color: "green",
    })
      .setPopup(new mapboxgl.Popup({
        closeButton: false,
        className: "mapbox-marker-point-with-popup",
        closeOnClick: false,
      })
        .setHTML(
          `
          <div class="d-flex align-center justify-center ga-2 bg-black">
            <i class="fi fi-rr-marker text-green"></i>
            <div style="
              text-overflow: ellipsis;
              max-width: 76px;
              overflow: hidden;
              white-space: nowrap;
            ">
              ${Store.traveller.current.to.name || "Route sans nom"}
            </div>
          </div>
        `
        )
      )
      .setLngLat(Store.traveller.current.to)
      .addTo(map.value)
      .togglePopup()

    map.value.fitBounds(routes[0].meta.bounds, { padding: 80 });
  })
}

async function relaunch(data?: Partial<ITravel2>) {
  showUpdatePriceInfo.value = false;
  showUpdatePrice.value = false;

  try {
    const response = await Socket.emit(
      "travel:search-driver",
      { ...Store.traveller.current, ...(data || {}) }
    );

    Store.traveller.setCurrent(response)
    waitEnd()
  } finally {
  }
}

onMounted(waitEnd)
function waitEnd() {
  searching.value = true
  showUpdatePrice.value = false
  showUpdatePriceInfo.value = false


  myPrice.value = Store.traveller.current?.price.amount || 0
  setTimeout(() => {
    searching.value = false
    showUpdatePriceInfo.value = true
  }, 60000);
}

onMounted(() => {
  Socket.socket.on('travel:driver-accept', onDriverAccept)
  Socket.socket.on('travel:cancel', onCancel)
})

function onCancel(data: ITravel) {
  if (Store.traveller.current?.id === data.id) {
    Store.traveller.setCurrent()
  }
}

function onDriverAccept(data: { price: number, id: string, key: string, duration: number }) {
  console.log(data);

  if (data.id === Store.traveller.current?.id) {
    offers.value.push(data)
  }
}

onBeforeUnmount(destroy);
onDeactivated(destroy);
function destroy() {
  Socket.socket.off('travel:driver-accept', onDriverAccept)
  Socket.socket.off('travel:cancel', onCancel)
}
</script>

<template>
  <div v-if="Store.traveller.current" class="h-screen d-flex flex-column">
    <div class="bg-background pb-1" style="position: sticky; width: 100%; top: 0;z-index: 560;" :style="{
      paddingTop: `${Store.app.statusBar.height + 5}px`,
    }">

      <div style="height: 60px;" class="bg-background rounded-pill d-flex align-center px-1 mx-2 ga-2">
        <v-btn icon color="dark" variant="tonal" size="32" @click="Store.traveller.setCurrent()">
          <i class="fi fi-br-cross-small"></i>
        </v-btn>
      </div>
    </div>

    <div style="position: relative;width: 100%;">
      <div ref="mapContainer" style="position: relative; width: 100%; height: 350px;"></div>
      <div style="position: absolute;top: 0;left: 0;width: 100%;height: 100%;"></div>
    </div>

    <div style="padding-bottom: 60px;">
      <div v-if="!offers.length" class="text-center mt-16">
        En attente de conducteur.
      </div>

      <c-offer v-for="offer in offers" :key="offer.key" :travel="Store.traveller.current" :offer="offer" />

    </div>

    <div
      style="position: fixed;bottom: 0;width: 100%;z-index: 10;box-shadow: rgba(var(--v-theme-on-background), .1) 0px 1px 15px;"
      class="bg-background d-flex flex-column justify-center align-center">

      <v-progress-linear v-if="searching" indeterminate :height="2" color="primary" style="width: 100%" />

      <div class="d-flex align-center justify-center ga-5 py-4">
        <div class="d-flex align-center ga-1">
          <i class="fi fi-rr-route"></i>
          {{ Num.formatDistance(Store.traveller.current.distance) }}
        </div>

        <div class="d-flex align-center ga-1">
          <i class="fi fi-rr-stopwatch"></i>
          {{ Num.formatDuration(Store.traveller.current.duration) }}
        </div>

        <div class="d-flex align-center ga-1">
          <i class="fi fi-rs-ticket"></i>
          {{ Store.traveller.current.price.amount }}
          {{ Store.traveller.current.price.currency }}


          <v-dialog max-width="500" v-model="showUpdatePrice">
            <template v-slot:default="{ isActive }">
              <v-card rounded="pill">
                <v-card-text class="pa-0">
                  <v-text-field autofocus variant="outlined" class="pg-travel--define-update-price" hide-details
                    v-model="myPrice" rounded="pill" type="number"
                    @keypress.enter="isActive.value = false; relaunch({ price: { ...Store.traveller.current.price, amount: myPrice } })">
                    <template #prepend-inner>
                      <div style="opacity: 0.5">MAD</div>
                    </template>
                    <template v-if="myPrice" #append-inner>
                      <v-btn text="ok" rounded="pill"
                        @click="
                          isActive.value = false;; relaunch({ price: { ...Store.traveller.current.price, amount: myPrice } })">Relancer</v-btn>
                    </template>
                  </v-text-field>
                </v-card-text>
              </v-card>
            </template>
          </v-dialog>

          <v-tooltip v-if="!searching" v-model="showUpdatePriceInfo" offset="10" location="top" origin="bottom"
            content-class="bg-transparent pa-0" :content-props="{ style: { maxWidth: '200px' } }">
            <template #activator="{ props }">
              <div v-bind="props" style="position: relative;">
                <div v-if="showUpdatePriceInfo"
                  style="position: absolute;bottom: calc(100% + 3px);left: 50%;transform: translateX(-50%) rotateZ(45deg); width: 20px;height: 20px;border-radius: 3px;"
                  class="bg-black"></div>
                <v-btn size="22" icon @click="showUpdatePrice = true">
                  <i class="fi fi-sr-pencil" style="font-size: 10px;"></i>
                </v-btn>
              </div>
            </template>

            <div class="bg-black rounded-lg pa-3" style="position: relative;">
              Augmentez le prix pour attirer des conducteurs.
            </div>
          </v-tooltip>
        </div>
      </div>
    </div>
  </div>
</template>
