<script lang="ts" setup>
import type { IPoint } from "~/models/Map";

const emit = defineEmits<{
  (e: "select", point: IPoint): void;
  (e: "close"): void;
}>();

const { $mapbox } = useNuxtApp();
const text = ref("");
const places = ref<any[]>([]);

watch(() => text.value, search);
async function search() {
  places.value = [];
  if (!text.value) return;

  const response = await $mapbox.search(text.value);
  const suggestions = response.suggestions.filter(
    (suggestion: any) => suggestion.feature_type !== "category"
  );

  console.log(suggestions);

  places.value = suggestions;
}
async function select(mapbox_id: string) {
  const features = await $mapbox.get(mapbox_id);
  const feature = features.features[0];

  const _point = {
    lat: feature.properties.coordinates.latitude,
    lng: feature.properties.coordinates.longitude,
  };

  emit("select", {
    lat: _point.lat,
    lng: _point.lng,
    name: feature.properties.name_preferred,
    place: feature.properties.place_formatted,
  });
}
</script>

<template>
  <div class="bg-background">
    <div class="py-3" v-if="places.length">
      <v-list-item
        v-for="place in places"
        :key="place.mapbox_id"
        class="py-3"
        @click="select(place.mapbox_id)"
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
    </div>

    <div
      class="bg-background pa-3"
      style="position: sticky; bottom: 0; z-index: 610"
    >
      <v-text-field
        v-model="text"
        placeholder="Rechercher un lieu"
        variant="solo"
        flat
        rounded
        autofocus
        hide-details
      >
        <template #prepend-inner>
          <i class="fi fi-rr-marker"></i>
        </template>

        <template #append-inner>
          <v-btn
            rounded="pill"
            variant="tonal"
            color="dark"
            @click="emit('close')"
          >
            carte
          </v-btn>
        </template>
      </v-text-field>
    </div>
  </div>
</template>
