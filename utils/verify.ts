import { isString } from "class-validator";

export default {
  isLatLng(objet: any) {
    return (
      objet && typeof objet.lat === "number" && typeof objet.lng === "number"
    );
  },

  isNumber(value: any) {
    return typeof value === "number";
  },

  isString(value: any) {
    return typeof value === "string";
  },
};
