import mapboxgl from "mapbox-gl";
import Axios from "axios";

export default defineNuxtPlugin({
  name: "mapbox",

  async setup(nuxtApp) {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

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

        navigation() {
          const div = document.createElement("div");

          const navigation = document.createElement("div");
          navigation.className = "mapbox-marker-navigation";
          navigation.style.width = "48px";
          navigation.style.height = "48px";
          div.appendChild(navigation);

          const icon = `<svg viewBox="0 0 64 64">
            <g>
              <path
                fill="rgb(var(--v-theme-primary))" 
                d="M2.73 52.205c-2.812 5.628 2.918 11.713 8.704 9.232L28.06 54.31a10 10 0 0 1 7.88 0l16.626 7.128c5.786 2.48 11.516-3.604 8.703-9.232L38.042 5.735c-2.49-4.98-9.595-4.98-12.084 0z" stroke="#ffffff" stroke-width="5"></path>
            </g>
          </svg>
          `;

          navigation.innerHTML = icon;

          return div;
        },

        radar() {
          const div = document.createElement("div");

          const radar = document.createElement("div");
          radar.className = "mapbox-marker-radar";
          div.appendChild(radar);

          for (let i = 0; i < 3; i++) {
            const circle = document.createElement("div");
            circle.className = "mapbox-marker-radar--circle";
            radar.appendChild(circle);
          }

          const point = document.createElement("div");
          point.className = "mapbox-marker-radar--point";
          radar.appendChild(point);

          return div;
        },
      },

      calculateBearing(
        position: { lat: number; lng: number },
        route: IMapRoute
      ) {
        // Fonction utilitaire pour convertir degrés en radians
        const toRadians = (degrees: any) => {
          return (degrees * Math.PI) / 180;
        };

        // Fonction utilitaire pour convertir radians en degrés
        const toDegrees = (radians: any) => {
          return (radians * 180) / Math.PI;
        };

        const start = position;
        const end = route.meta.coordinates[1];

        const startLat = toRadians(start.lat);
        const startLng = toRadians(start.lng);
        const endLat = toRadians(end[1]);
        const endLng = toRadians(end[0]);

        const dLng = endLng - startLng;

        const y = Math.sin(dLng) * Math.cos(endLat);
        const x =
          Math.cos(startLat) * Math.sin(endLat) -
          Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);

        const bearing = Math.atan2(y, x);
        return (toDegrees(bearing) + 360) % 360;
      },

      async search(q: string) {
        const response = await Axios.get(
          "https://api.mapbox.com/search/searchbox/v1/suggest",
          {
            params: {
              language: Store.app.lang.code,
              country: "sn", // Store.app.details.country
              proximity: `${Store.position.position.lng},${Store.position.position.lat}`,
              session_token: "07a290ed-2d48-4e21-88f0-d2d49560c871",
              access_token: mapboxgl.accessToken,
              q: q.split(" ").join("+"),
              limit: 10,
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
    };

    return { provide: { mapbox } };
  },
});
