import { defineStore } from "pinia";
import type { ITravel } from "~/models/Travel";

const travellerStore = defineStore(
  "traveller",
  () => {
    const current = ref<ITravel>();
    function setCurrent(value?: ITravel) {
      current.value = value;
    }

    async function init() {
      current.value = undefined;
    }

    function clean() {
      current.value = undefined;
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
