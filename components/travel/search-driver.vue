<script lang="ts" setup>
import L from "leaflet";
import type { ITravel } from "~/models/Travel";

const props = defineProps({
  map: { type: Object as PropType<L.Map>, required: true },
});
const { $map } = useNuxtApp();
const hideBottom = ref(false);
const accepting = ref(false);
const curentPositionMarker = ref<L.Marker>();

onMounted(mounted);
function mounted() {
  curentPositionMarker.value = L.marker(Store.position.position.current!, {
    draggable: false,
    icon: L.divIcon({
      html: $map.icons.point,
      className: "",
      iconSize: [24, 24],
    }),
  }).addTo(props.map);

  props.map.on("dragstart", () => (hideBottom.value = true));
  props.map.on("dragend", () => (hideBottom.value = false));

  setTimeout(toCenter, 100);

  setTimeout(() => {
    if (Store.travel.current && Store.travel.current.step === "search_driver") {
      Store.travel.setCurrent({
        ...Store.travel.current,
        step: "define_route",
      });
    }
  }, 2000);
}

function toCenter() {
  if (!props.map) return;

  props.map.setZoom(16);
  props.map.setView(Store.position.position.current!);
}

onMounted(onAccept);
function onAccept() {
  Socket.socket.on("travel:accept", (data: any) => {
    if (Store.travel.current?.step === "search_driver") {
      Store.travel.pushAccept(data);

      setTimeout(() => {
        if (Store.travel.current?.step !== "search_driver") return;
        Store.travel.removeAccept(data.id);
      }, 6000);
    }
  });
}

async function accept(offer: any) {
  if (!Store.travel.current) return;

  accepting.value = true;
  const travel = await Socket.emit<ITravel>("travel:search-driver", {
    id: Store.travel.current.id,
    offer: offer.id,
  });

  Store.travel.setCurrent(travel);

  accepting.value = false;
}

onBeforeUnmount(destroy);
onDeactivated(destroy);
function destroy() {
  if (curentPositionMarker.value) curentPositionMarker.value.remove();

  props.map.off("drag");
  props.map.off("dragstart");
  props.map.off("dragend");
  Socket.socket.off("travel:accept");
}
</script>

<template>
  <transition
    apper
    enter-active-class="animate__animated animate__slideInUp"
    leave-active-class="animate__animated animate__slideOutDown"
  >
    <div
      v-if="Store.travel.current"
      v-show="!accepting && !hideBottom"
      class="travel-search-driver--bottom"
    >
      <div class="bg-background">
        <div
          v-for="offer in Store.travel.current.accepts || []"
          :key="offer.id"
          class="d-flex align-center pa-3 ga-2"
        >
          <v-avatar size="42">
            <v-icon size="42" icon="mdi-account-circle" />
          </v-avatar>
          <div style="line-height: 1">
            <div style="font-weight: bold">{{ "Driver Name" }}</div>
            <div class="mt-1">
              {{ "Car model" }} - {{ Num.formatDuration(offer.time) }}
            </div>
          </div>

          <div class="ml-auto" style="font-weight: bold">
            <span style="opacity: 0.5">MAD</span>
            {{ offer.price }}
          </div>

          <v-btn rounded="lg" @click="accept(offer)">
            {{ offer.awaitTime }}
            accept
          </v-btn>
        </div>

        <div
          class="pa-5 bg-background d-flex"
          style="position: sticky; bottom: 0; z-index: 100"
        >
          <v-progress-linear
            indeterminate
            :height="12"
            rounded
            rounded-bar
            stream
            striped
            color="primary"
            bg-color="light"
            style="width: 200px"
          />
        </div>
      </div>
    </div>
  </transition>

  <div style="position: fixed; bottom: 20px; right: 30px; z-index: 20000">
    <v-progress-circular
      v-if="accepting"
      color="primary"
      indeterminate
      :size="32"
      :width="5"
    />
  </div>
</template>

<style lang="scss" scoped>
.travel-search-driver--bottom {
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
    overflow: auto;
    max-height: 70lvh;
    position: relative;

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
.travel-search-driver--summary-price-input {
  .v-field {
    padding-left: 4px;
    padding-right: 4px;

    input {
      text-align: center;
      font-weight: bold;
    }
  }
}

.travel-search-driver--home-marker-mobile {
  --v-theme-primary: 0, 0, 0;
}
</style>
