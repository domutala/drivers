<script lang="ts" setup>
import mapboxgl, { GeoJSONSource } from 'mapbox-gl';

const { $mapbox } = useNuxtApp();
const map = ref<mapboxgl.Map>();
const mapContainer = ref<HTMLDivElement>();
const indexSimulatePosition = ref(0)

const departure = ref({ lng: 0, lat: 0 })
const destination = ref({ lng: -9.410896000000001, lat: 30.326156500000003 })
const route = ref<IMapRoute>()
const routeCovered = ref<any>({
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {},
      geometry: {
        coordinates: [],
        "type": "LineString"
      }
    }
  ]
})

const currentPosition = ref<mapboxgl.Marker>()
const iChangeMapView = ref(false)


onMounted(init);
async function init() {
  if (!mapContainer.value) return;

  departure.value = Store.position.position.current
  routeCovered.value.features[0].geometry.coordinates = [[Store.position.position.current.lng, Store.position.position.current.lat]]


  map.value = $mapbox.createMap({
    container: mapContainer.value,
    center: departure.value,
    zoom: 13,
  }).on("style.load", () => {
    if (!map.value) return;

    // map.value.on('zoom', () => iChangeMapView.value = true)
    // map.value.on('rotate', () => iChangeMapView.value = true)
    // map.value.on('move', () => iChangeMapView.value = true)

    const el = $mapbox.markers.navigation();
    currentPosition.value = new mapboxgl.Marker({ element: el })
      .setLngLat(departure.value)
      .addTo(map.value);

    updateRoute()
  })

  // updatePosition()
}

watch(() => Store.position.position.current, () => {
  // departure.value = Store.position.position.current
  // routeCovered.value.features[0].geometry.coordinates.push([departure.value.lng, departure.value.lat])
  // updateRoute()
}, { deep: true })

function updatePosition() {
  setTimeout(() => {
    if (route.value) {
      indexSimulatePosition.value++

      const pos = route.value.meta.coordinates[indexSimulatePosition.value]
      routeCovered.value.features[0].geometry.coordinates.push(pos)

      departure.value = { lng: pos[0], lat: pos[1] }
      if (indexSimulatePosition.value < route.value.meta.coordinates.length) {
        updatePosition()
      }
    } else updatePosition()
  }, 1000);
}

watch(() => departure.value, updateRoute, { deep: true })
async function updateRoute() {
  if (!map.value) return;

  const routes = await $mapbox.route({
    departure: departure.value,
    destination: destination.value,
  });
  route.value = routes[0]

  if (map.value.getLayer("line")) map.value.removeLayer("line");
  if (map.value.getSource("line")) map.value.removeSource("line");

  if (map.value.getLayer("lineCovered")) map.value.removeLayer("lineCovered");
  if (map.value.getSource("lineCovered")) map.value.removeSource("lineCovered");

  map.value.addSource("line", {
    type: "geojson",
    lineMetrics: true,
    data: route.value.geojson as any,
  });
  map.value.addLayer({
    type: "line",
    source: "line",
    id: "line",
    paint: { "line-color": "#1fff62", "line-width": 12 },
    layout: { "line-cap": "round", "line-join": "round" },
  });

  map.value.addSource("lineCovered", {
    type: "geojson",
    lineMetrics: true,
    data: routeCovered.value!,
  });
  map.value.addLayer({
    type: "line",
    source: "lineCovered",
    id: "lineCovered",
    paint: { "line-color": "#d4d4d4", "line-width": 12 },
    layout: { "line-cap": "round", "line-join": "round" },
  });

  if (currentPosition.value) {
    currentPosition.value.setLngLat(departure.value)
  }

  flyto()
}

function flyto() {
  if (iChangeMapView.value) return
  if (!map.value) return;
  if (!route.value) return;

  map.value.flyTo({
    center: departure.value,
    zoom: 19,
    bearing: $mapbox.calculateBearing(departure.value, route.value),
    duration: 0,
  });
}



</script>

<template>
  <div ref="mapContainer"></div>
</template>