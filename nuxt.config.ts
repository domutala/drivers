// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },

  ssr: false,

  modules: [
    "vuetify-nuxt-module",
    "@pinia/nuxt",
    "@pinia-plugin-persistedstate/nuxt",
    "@nuxtjs/svg-sprite",
    "@vite-pwa/nuxt",
  ],

  plugins: ["~/plugins/map.ts", "~/plugins/mapbox.ts"],

  components: [{ path: "~/components/ui", global: true, prefix: "ui" }],

  css: [
    "animate.css/animate.min.css",
    "@flaticon/flaticon-uicons/css/all/all.css",
    "~/assets/styles/main.scss",
  ],

  pwa: {
    manifest: {
      name: "Stream",
      short_name: "Stream",
      theme_color: "#ff9d00",
    },
  },
});
