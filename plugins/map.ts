import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "@maptiler/leaflet-maptilersdk";
import "leaflet-routing-machine";

export default defineNuxtPlugin({
  name: "map",

  async setup(nuxtApp) {
    const icons = {
      spin: `<svg class="map-icon-spin" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M24 4.051A12 12 0 1 0 8.218 22.125a29.186 29.186 0 0 1 6.9 8.351A1 1 0 0 0 16 31a1 1 0 0 0 .88-.526l.082-.154a29.5 29.5 0 0 1 6.89-8.257A11.989 11.989 0 0 0 24 4.051zM16 18a5 5 0 1 1 5-5 5.006 5.006 0 0 1-5 5z"></path></g>


        <style>
          .map-icon-spin {
            fill: rgb(var(--v-theme-primary));
          }
        </style>
      </svg>`,

      point: `<svg class="map-icon-point" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512.002 512.002" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><circle cx="256.001" cy="256.001" r="200" style="fill-rule:evenodd;clip-rule:evenodd;" transform="rotate(-45.001 256 256.005)"></circle><circle cx="256.001" cy="256.001" r="246.001" style="fill-rule:evenodd;clip-rule:evenodd;stroke-width:20.0001;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:22.9256;" transform="rotate(-45.001 256 256.005)" fill-rule="evenodd" clip-rule="evenodd" fill="none" class="map-icon-point-stroke" stroke-width="20.0001" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="22.9256"></circle></g>
      
        <style>
          .map-icon-point {
            fill: rgb(var(--v-theme-primary));
          }

          .map-icon-point-stroke {
            stroke: rgb(var(--v-theme-primary));
          }
        </style>
      </svg>`,

      point2: `<svg viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
      <!-- Ombre du cercle -->
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feOffset in="SourceAlpha" dx="0" dy="0" result="offset"/>
          <feGaussianBlur in="offset" stdDeviation="14" result="blur"/>
          <feBlend in="SourceGraphic" in2="blur"/>
        </filter>
      </defs>
      
      <!-- Cercle à l'arrière avec ombre -->
      <circle cx="70" cy="70" r="70" fill="none" />
      
      <circle cx="70" cy="70" r="45" fill="#fff" class="circle-out" filter="url(#shadow)" />
    
      <!-- Cercle à l'avant avec l'animation -->
      <circle cx="70" cy="70" r="35" class="circle-in" style="fill: rgb(var(--v-theme-primary));">
        <animate attributeName="r" values="35;30;35" dur="3s" repeatCount="indefinite" />
      </circle>
    
      <style>
        /* Couleur de l'ombre */
        #shadow feBlend {
          color-interpolation-filters: sRGB;
          in2: rgba(var(--v-theme-primary));
        }
      </style>
    </svg>`,

      car: `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><g data-name="13-car"><path d="M120 236a52 52 0 1 0 52 52 52.059 52.059 0 0 0-52-52Zm0 76a24 24 0 1 1 24-24 24 24 0 0 1-24 24ZM408 236a52 52 0 1 0 52 52 52.059 52.059 0 0 0-52-52Zm0 76a24 24 0 1 1 24-24 24 24 0 0 1-24 24Z" ></path><path d="M477.4 193.04 384 176l-79.515-65.975A44.109 44.109 0 0 0 276.526 100H159.38a43.785 43.785 0 0 0-34.359 16.514L74.232 176H40a36.04 36.04 0 0 0-36 36v44a44.049 44.049 0 0 0 44 44h9.145a64 64 0 1 1 125.71 0h162.29a64 64 0 1 1 125.71 0H472a36.04 36.04 0 0 0 36-36v-35.368a35.791 35.791 0 0 0-30.6-35.592ZM180 164a12 12 0 0 1-12 12h-52.755a6 6 0 0 1-4.563-9.9l34.916-40.9a12 12 0 0 1 9.126-4.2H168a12 12 0 0 1 12 12Zm60 56h-16a12 12 0 0 1 0-24h16a12 12 0 0 1 0 24Zm94.479-43.706-114.507-.266a12 12 0 0 1-11.972-12V133a12 12 0 0 1 12-12h57.548a12 12 0 0 1 7.433 2.58l53.228 42a6 6 0 0 1-3.73 10.714Z" ></path></g></g></svg>`,
    };
    const map = {
      init(el: HTMLElement, options?: L.MapOptions) {
        const map = L.map(el, { zoomControl: false }).setView(
          Store.position.position.current!,
          13
        );

        new L.MaptilerLayer({ apiKey: "PCOet3huqSO1AcUHxg48" }).addTo(map);

        return map;
      },

      icons,
    };

    return { provide: { map } };
  },
});
