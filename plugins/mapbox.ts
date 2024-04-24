import mapboxgl from "mapbox-gl"; // or "const mapboxgl = require('mapbox-gl');"
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
// import MapboxDirections from "@mapbox/mapbox-gl-directions";

import Axios from "axios";

import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

export default defineNuxtPlugin({
  name: "mapbox",

  async setup(nuxtApp) {
    mapboxgl.accessToken =
      "pk.eyJ1IjoibWFtYWRvdXRhbGxhZGlhIiwiYSI6ImNrcWdpY2RzNjA0YXkycXJvaGI4ZHNpbTAifQ.M_2fTMFrpYwZ4gaukK1SRg";

    const mapbox = {
      createMap(options: mapboxgl.MapboxOptions) {
        const map = new mapboxgl.Map({
          style: "mapbox://styles/mapbox/streets-v12",
          ...options,
        });

        return map;
      },

      markers: {
        point() {
          const div = document.createElement("div");

          const point = document.createElement("div");
          point.className = "mapbox-marker-point";
          div.appendChild(point);

          const radial = document.createElement("div");
          radial.className = "mapbox-marker-point--radial";
          point.appendChild(radial);

          const circle = document.createElement("div");
          circle.className = "mapbox-marker-point--circle";
          point.appendChild(circle);

          return div;
        },
      },

      async search(q: string) {
        const response = await Axios.get(
          "https://api.mapbox.com/search/searchbox/v1/suggest",
          {
            params: {
              language: "fr",
              country: "ma",
              proximity: `${Store.position.position.current.lng},${Store.position.position.current.lat}`,
              session_token: "07a290ed-2d48-4e21-88f0-d2d49560c871",
              access_token: mapboxgl.accessToken,
              q: q.split(" ").join("+"),
            },
          }
        );

        return response.data;
      },
      async get(id: string) {
        const response = await Axios.get(
          `https://api.mapbox.com/search/searchbox/v1/retrieve/${id}`,
          {
            params: {
              session_token: "07a290ed-2d48-4e21-88f0-d2d49560c871",
              access_token: mapboxgl.accessToken,
            },
          }
        );

        return response.data;
      },

      async lookup(coords: { longitude: number; latitude: number }) {
        const response = await Axios.get(
          `https://api.mapbox.com/search/searchbox/v1/reverse`,
          {
            params: {
              ...coords,
              access_token: mapboxgl.accessToken,
            },
          }
        );
        return response.data;
      },

      async route(params: {
        departure: { lat: number; lng: number };
        destination: { lat: number; lng: number };
      }) {
        const routes = await Socket.emit<IMapRoute[]>(
          "travel:define-route",
          params
        );

        return routes;
      },

      geocoder(
        map: mapboxgl.Map,
        options: Partial<MapboxGeocoder.GeocoderOptions> = {}
      ) {
        const geocoder = new MapboxGeocoder({
          language: "fr",
          countries: "ma",
          ...options,
          accessToken: mapboxgl.accessToken,
          mapboxgl: mapboxgl,
        });

        map.addControl(geocoder);

        return geocoder;
      },
    };

    return { provide: { mapbox } };
  },
});
