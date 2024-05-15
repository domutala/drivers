<script lang="ts" setup>
import mapboxgl from "mapbox-gl";
import { mergeProps } from "vue";
import type { ITravel } from "~/models/Travel";

const props = defineProps({
  travel: { type: Object as PropType<ITravel>, required: true },
});

const { $mapbox } = useNuxtApp();
const map = ref<mapboxgl.Map>();
const mapContainer = ref<HTMLDivElement>();
const isOpen = ref(false);
const isPriceTootip = ref(false);
const delay = 15;
const timer = ref({ value: 0, percent: 0 });
const routeToTraveller = ref<IMapRoute>();
const myPrice = ref(0);

onMounted(async () => {
  myPrice.value = Number(props.travel.price.amount);
  try {
    const routes = await $mapbox.route({
      departure: Store.position.position.current,
      destination: props.travel.from,
    });

    routeToTraveller.value = routes[0];
  } catch (error) {
    console.log(error);
  }
});

watch(() => isOpen.value, init);
async function init() {
  if (!isOpen) return;

  setTimeout(() => {
    if (!mapContainer.value) return;

    map.value = $mapbox
      .createMap({
        container: mapContainer.value,
        center: Store.position.position.current,
        zoom: 16,
      })
      .on("style.load", async () => {
        if (!map.value) return;

        const routes = await $mapbox.route({
          departure: props.travel.from,
          destination: props.travel.to,
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
              ${props.travel.from.name || "Route sans nom"}
            </div>
          </div>
        `
            )
          )
          .setLngLat(props.travel.from)
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
              ${props.travel.to.name || "Route sans nom"}
            </div>
          </div>
        `
            )
          )
          .setLngLat(props.travel.to)
          .addTo(map.value)
          .togglePopup();

        map.value.fitBounds(routes[0].meta.bounds, {
          duration: 0,
          padding: 80,
        });
      });
  }, 100);
}

watch(() => isOpen.value, onDialogSwitch);
function onDialogSwitch() {
  // if (isOpen.value) {
  //   setTimeout(() => {
  //     isPriceTootip.value = true;
  //     setTimeout(() => (isPriceTootip.value = false), 3000);
  //   }, 500);
  // } else isPriceTootip.value = false;
}

onMounted(setDelay);
function setDelay() {
  setTimeout(() => {
    if (timer.value.value < delay) {
      timer.value.value++;
      timer.value.percent = (timer.value.value / delay) * 100;
      setDelay();
    } else {
      Store.driver.remove(props.travel.id);
    }
  }, 1000);
}

async function accept() {
  const response = await Socket.emit("travel:driver-accept", {
    id: props.travel.id,
    price: Number(myPrice.value),
    duration: routeToTraveller.value?.meta.duration,
  });

  Store.driver.setAccept({ travel: props.travel, ...response });
}
</script>

<template>
  <div
    @click="isOpen = true"
    class="pa-3 py-3 d-flex align-center border-b position-relative"
  >
    <div
      style="
        position: absolute;
        top: 0;
        width: 100%;
        height: 100%;
        left: 0;
        opacity: 0.5;
        border-radius: 0;
        overflow: hidden;
      "
    >
      <div
        class="bg-red"
        style="
          position: absolute;
          top: 0;
          height: 100%;
          width: 100%;
          opacity: 0.5;
          border-radius: inherit;
          transition: all 0.9s ease;
        "
        :style="{ right: `${100 - timer.percent}%` }"
      ></div>
    </div>

    <div class="d-flex align-center justify-center ga-2 position-relative">
      <v-icon size="54" icon="mdi-account-circle" />
      <div style="line-height: 1">
        <div style="font-size: 22px">Mamadou</div>
        <div class="d-flex align-center ga-1">
          <i class="fi fi-rr-marker text-red"></i>
          {{ travel.from.name || "route sans nom" }}
        </div>
      </div>
    </div>

    <v-spacer />

    <div class="d-flex align-center justify-center ga-1 position-relative">
      <div
        style="
          display: flex;
          align-items: center;
          gap: 3px;
          text-wrap: nowrap;
          font-weight: bold;
        "
      >
        {{ travel.price.amount }}
        <div style="opacity: 0.5">{{ travel.price.currency }}</div>
      </div>
    </div>
  </div>

  <v-bottom-sheet
    color="background"
    bg-color="background"
    class="drvr-watch-demand--panel"
    :content-props="{
      style: {
        'max-height': '80lvh',
        'border-top-right-radius': '1.9em',
        'border-top-left-radius': '1.9em',
        overflow: 'hidden',
      },
    }"
    v-model="isOpen"
  >
    <v-card color="background">
      <div class="d-flex align-center pa-3 py-3">
        <div class="d-flex align-center justify-center ga-2">
          <v-icon size="54" icon="mdi-account-circle" />
          <div style="line-height: 1">
            <div style="font-size: 22px">Mamadou</div>
            <div class="d-flex align-center ga-1">
              <i class="fi fi-rr-marker text-red"></i>
              {{ travel.to.name || "route sans nom" }}
            </div>
          </div>
        </div>

        <v-spacer />

        <v-tooltip
          v-model="isPriceTootip"
          location="top right"
          content-class="bg-dark rounded-pill pa-0"
          offset="15"
        >
          <template #activator="{ props }">
            <v-dialog max-width="500">
              <template v-slot:activator="{ props: activatorProps }">
                <v-btn
                  v-bind="mergeProps(props, activatorProps)"
                  rounded="pill"
                  @click="myPrice = travel.price.amount"
                >
                  <div style="display: flex; align-items: center; gap: 2px">
                    {{ travel.price.amount }}
                    <div style="opacity: 0.5">{{ travel.price.currency }}</div>
                  </div>
                  <template #prepend>
                    <i class="fi fi-sr-pencil" style="font-size: 12px"></i>
                  </template>
                </v-btn>
              </template>

              <template v-slot:default="{ isActive }">
                <v-card rounded="pill">
                  <v-card-text class="pa-0">
                    <v-text-field
                      autofocus
                      variant="outlined"
                      class="pg-travel--define-update-price"
                      hide-details
                      v-model="myPrice"
                      rounded="pill"
                      type="number"
                      @keypress.enter="
                        isActive.value = false;
                        accept();
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
                          @click="
                            isActive.value = false;
                            accept();
                          "
                          >Accepter</v-btn
                        >
                      </template>
                    </v-text-field>
                  </v-card-text>
                </v-card>
              </template>
            </v-dialog>
          </template>

          <div
            style="
              position: absolute;
              bottom: 0;
              right: 30px;
              width: 20px;
              height: 20px;
              background-color: inherit;
              transform: rotateZ(45deg) translateX(50%);
              border-radius: 5px;
            "
          ></div>
          <div
            class="position-relative pa-2 rounded-pill"
            style="background-color: inherit"
          >
            Proposez un autre prix
          </div>
        </v-tooltip>
      </div>

      <div style="position: relative">
        <div
          ref="mapContainer"
          style="position: relative; width: 100%; height: 330px"
        ></div>
        <div
          style="
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0);
            z-index: 5;
          "
        ></div>
      </div>

      <div class="pa-5">
        <div class="d-flex align-center justify-center ga-2 mb-3">
          <i class="fi fi-rr-route"></i>
          {{ Num.formatDistance(travel.distance) }}

          <div>-</div>

          <i class="fi fi-rr-stopwatch"></i>
          {{ Num.formatDuration(travel.duration) }}
        </div>
        <div
          v-if="routeToTraveller"
          class="text-center mb-1 text-body-2"
          style="opacity: 0.5"
        >
          Vous êtes à
          {{ Num.formatDuration(routeToTraveller.meta.duration) }} de Mamadou
        </div>
        <div class="mx-5">
          <v-btn
            color="primary"
            rounded="pill"
            size="x-large"
            block
            @click="accept"
          >
            Accepter

            <div
              style="
                position: absolute;
                top: 0;
                width: 100%;
                height: 100%;
                left: 0;
                opacity: 0.5;
                border-radius: 16em;
                overflow: hidden;
              "
            >
              <div
                style="
                  background-color: #000;
                  position: absolute;
                  top: 0;
                  height: 100%;
                  width: 100%;
                  width: 100%;
                  opacity: 0.5;
                  animation-duration: 10s;
                  border-radius: inherit;
                  transition: all 0.9s ease;
                "
                :style="{ right: `${100 - timer.percent}%` }"
              ></div>
            </div>
          </v-btn>
        </div>
      </div>
    </v-card>
  </v-bottom-sheet>
</template>
