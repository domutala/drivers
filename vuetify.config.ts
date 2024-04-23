// vuetify.config.ts
import type { ExternalVuetifyOptions } from "vuetify-nuxt-module";
import colors from "vuetify/util/colors";

// const primaryColor = "#1fff62";
const primaryColor = "#ff8b1f";
const secondaryColor = "#ffff0000";

export default {
  theme: {
    defaultTheme: "light",

    themes: {
      light: {
        dark: false,
        colors: {
          primary: primaryColor,
          secondary: secondaryColor,
          surface: "#e7e7e7",
          dark: colors.grey.darken4,
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: primaryColor,
          secondary: secondaryColor,
          dark: colors.grey.lighten5,
          background: "#000000",
        },
      },
    },
  },

  defaults: {
    VBtn: {
      style: { "text-transform": "none" },
      variant: "flat",
      color: "primary",
    },
    VTextField: {
      variant: "outlined",
    },
    VTextarea: {
      variant: "outlined",
    },
    VSelect: {
      variant: "outlined",
    },
  },
} satisfies ExternalVuetifyOptions;
