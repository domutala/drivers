import { defineStore } from "pinia";
import type { ITravel } from "~/models/Travel";

const travelStore = defineStore(
  "travel",
  () => {
    const current = ref<ITravel>();
    function setCurrent(value: ITravel) {
      current.value = value;
    }
    function pushAccept(value: ITravel) {
      if (!current.value) return;

      current.value.accepts ||= [];

      const i = current.value.accepts.findIndex((v) => v.id === value.id);
      if (i === -1) current.value.accepts.push(value) - 1;
      else current.value.accepts[i] = value;
    }
    function removeAccept(id: string) {
      if (!current.value) return;

      const i = current.value.accepts.findIndex((v) => v.id === id);
      if (i !== -1) current.value.accepts.splice(i, 1);
    }

    const currents = ref<ITravel[]>([]);
    function pushCurrents(value: ITravel) {
      const i = currents.value.findIndex((v) => v.id === value.id);
      if (i === -1) currents.value.push(value) - 1;
      else currents.value[i] = value;

      // setTimeout(() => {
      //   removeCurrents(value.id);
      // }, 6000);
    }
    function removeCurrents(id: string) {
      const i = currents.value.findIndex((v) => v.id === id);
      if (i !== -1) currents.value.splice(i, 1);
    }

    async function init() {
      current.value = undefined;
      currents.value = [];
      // if (current.value?.step === "define_route") {
      //   current.value = undefined;
      // }
    }

    function clean() {
      current.value = undefined;
      currents.value = [];
    }

    return {
      current,
      setCurrent,
      pushAccept,
      removeAccept,

      currents,
      pushCurrents,
      removeCurrents,

      clean,
      init,
    };
  },
  { persist: true }
);

export default travelStore;
