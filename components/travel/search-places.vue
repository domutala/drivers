<script lang="ts" setup>
const { $mapbox } = useNuxtApp();

const text = ref("");
const places = ref<any[]>([]);
const searching = ref(false);
let controller = new AbortController();
let signal = controller.signal;
const { $router } = useNuxtApp();
const emit = defineEmits<{ (e: "place", value: any): void }>();

watch(() => text.value, search);
async function search() {
  const response = await $mapbox.search(text.value);

  const suggestions = response.suggestions.filter(
    (suggestion: any) => suggestion.feature_type !== "category"
  );

  places.value = suggestions;
}
async function searchOld() {
  controller.abort();
  searching.value = true;
  places.value = [];

  const newController = new AbortController();
  const newSignal = newController.signal;

  controller = newController;
  signal = newSignal;

  try {
    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/autocomplete?text=${
        text.value
      }&format=json&apiKey=${import.meta.env.VITE_GEOAPIFY_KEY}`,
      { signal: signal }
    );
    const data = await response.json();
    places.value = data.results;
  } finally {
    if (!signal.aborted) {
      searching.value = false;
    }
  }
}

async function takePlace(mapbox_id: string) {
  emit("place", mapbox_id);
  $router.back();
}
</script>

<template>
  <div
    style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: auto;
      z-index: 600;
    "
    class="bg-background"
  >
    <div
      class="border-b bg-background"
      style="position: sticky; top: 0; z-index: 610"
      :style="{ paddingTop: `${Store.app.statusBar.height}px` }"
    >
      <div class="pa-5">
        <v-text-field
          v-model="text"
          rounded
          autofocus
          placeholder="Ou allez-vous ?"
        >
          <template #prepend-inner>
            <i class="fi fi-rr-marker"></i>
          </template>

          <template #append-inner>
            <v-btn
              rounded="pill"
              variant="tonal"
              color="dark"
              @click="$router.back()"
              >carte</v-btn
            >
          </template>
        </v-text-field>
      </div>
    </div>

    <v-list-item
      v-for="place in places"
      :key="place.mapbox_id"
      class="py-3"
      @click="takePlace(place.mapbox_id)"
    >
      <template v-slot:prepend>
        <i class="fi fi-rr-marker mr-3" style="opacity: 0.5"></i>
      </template>

      <template #title>
        <div style="line-height: 1">
          <div>{{ place.name }}</div>
          <div style="font-size: 80%; opacity: 0.7; margin-top: 5px">
            {{ place.place_formatted }}
          </div>
        </div>
      </template>
    </v-list-item>

    <div
      v-if="!places.length"
      class="py-5 d-flex justify-center mt-16 travel-search-places--empty"
    >
      <svg-icon width="92" height="92" name="map-3d" />
    </div>
  </div>
</template>

<style lang="scss">
.travel-search-places--empty {
  svg {
    --svg-plan-color: rgba(var(--v-theme-primary), 0.4);
  }
}
</style>
