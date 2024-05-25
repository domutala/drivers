import { defineStore } from "pinia";
import type { IMapRoute } from "~/models/Map";
import type { ITravel, TravelStep } from "~/models/Travel";

const travellerStore = defineStore(
  "traveller",
  () => {
    const current = ref<{
      step: TravelStep;
      value?: { travel: ITravel; route: IMapRoute };
    }>({ step: "define_route" });

    function setCurrent(value?: {
      step: TravelStep;
      value?: { travel: ITravel; route: IMapRoute };
    }) {
      current.value = value || { step: "define_route" };
    }

    async function init() {
      current.value = { step: "define_route" };
    }

    function clean() {
      current.value = { step: "define_route" };
    }

    return {
      current,
      setCurrent,

      clean,
      init,
    };
  },
  { persist: true }
);

export default travellerStore;
