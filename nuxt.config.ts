// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,

  devtools: { enabled: false },

  modules: [
    "@pinia/nuxt",
    "@pinia-plugin-persistedstate/nuxt",
    "vuetify-nuxt-module",
  ],

  css: ["leaflet/dist/leaflet.css", "~/assets/styles/main.scss"],

  plugins: ["~/plugins/map"],
});
