<script lang="ts" setup>
const { $mapbox } = useNuxtApp();
const map = ref<mapboxgl.Map>();
const mapContainer = ref<HTMLDivElement>();
const isOpen = ref(false);
const delay = ref(60);

onMounted(init);
async function init() {
  if (!mapContainer.value) return;

  map.value = $mapbox.createMap({
    container: mapContainer.value,
    center: Store.position.position.current,
    zoom: 16,
  });
}

function onOpen(is: boolean) {
  isOpen.value = is;
}

onMounted(setDelay);
function setDelay() {
  setTimeout(() => {
    if (delay.value > 0) {
      delay.value--;
      setDelay();
    } else {
      // fermer
    }
  }, 1000);
}
</script>

<template>
  <v-expansion-panel
    color="background"
    bg-color="background"
    class="drvr-watch-demand--panel"
    collapse-icon=""
    expand-icon=""
    @group:selected="(v) => onOpen(v.value)"
  >
    <v-expansion-panel-title class="pa-3 py-3" collapse-icon="" expand-icon="">
      <div class="d-flex align-center justify-center ga-2">
        <v-icon size="54" icon="mdi-account-circle" />
        <div style="line-height: 1">
          <div style="font-size: 22px">Mamadou</div>
          <div>Lorem ipsum dolor</div>
        </div>
      </div>

      <v-spacer />

      <div class="d-flex align-center justify-center ga-1">
        <div style="text-wrap: nowrap">250 MAD</div>
        <v-btn v-if="isOpen" icon size="30" @click.stop>
          <i class="fi fi-sr-pencil"></i>
        </v-btn>
        <div
          v-else
          class="bg-red rounded-pill"
          variant="flat"
          style="
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
          "
        >
          {{ delay }}
        </div>
      </div>
    </v-expansion-panel-title>

    <div
      style="overflow: auto; position: relative; transition: all 0.25s ease"
      :style="{ height: isOpen ? '300px' : 0 }"
    >
      <div
        ref="mapContainer"
        style="position: absolute; width: 100%; height: 300px"
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

    <v-expansion-panel-text>
      <div class="mt-5 d-flex align-center justify-center ga-2">
        <i class="fi fi-rr-route"></i>
        {{ Num.formatDistance(2500) }}

        <div>-</div>

        <i class="fi fi-rr-stopwatch"></i>
        {{ Num.formatDuration(25485) }}
      </div>
      <div class="text-center mt-3 text-body-2" style="opacity: 0.5">
        Vous êtes à 5 minutes de Mamadou
      </div>
      <v-btn color="primary" rounded="pill" size="x-large" class="mb-5" block>
        Accepter
      </v-btn>
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>

<style lang="scss">
.drvr-watch-demand--panel {
  .v-expansion-panel-title__overlay {
    display: none;
  }

  .v-expansion-panel-title__icon {
    display: none;
  }
}
</style>
