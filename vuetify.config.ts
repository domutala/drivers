import type { ExternalVuetifyOptions } from "vuetify-nuxt-module";
import colors from "vuetify/util/colors";

const primaryColor = "#315aff";
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
          background: "#0e0e0e",
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
    VBottomSheet: {
      color: "background",
      bgColor: "background",
      inset: true,
      contentProps: {
        style: {
          overflow: "hidden",
          maxHeight: "80lvh",
          borderTopRightRadius: "1.6em",
          borderTopLeftRadius: "1.6em",
        },
      },

      VCard: {
        color: "background",
      },
    },
  },
} satisfies ExternalVuetifyOptions;
