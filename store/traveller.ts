import { defineStore } from "pinia";
import type { ITravel } from "~/models/Travel";

const travellerStore = defineStore(
  "traveller",
  () => {
    const travels = ref<ITravel[]>([]);
    const current = ref<ITravel>();
    function setCurrent(value?: ITravel) {
      current.value = value;
    }

    async function init() {
      current.value = undefined;
      travels.value = await Socket.emit("travel:traveller:get-travels");
    }

    function clean() {
      current.value = undefined;
      travels.value = [];
    }

    return {
      current,
      setCurrent,
      travels,

      clean,
      init,
    };
  },
  { persist: true }
);

export default travellerStore;
