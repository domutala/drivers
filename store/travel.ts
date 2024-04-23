import { defineStore } from "pinia";
import type { ITravel } from "~/models/Travel";

const travelStore = defineStore(
  "travel",
  () => {
    const current = ref<ITravel>();
    function setCurrent(value: ITravel) {
      current.value = value;
    }
    function getAccept(id: string) {
      if (!current.value) return;

      const i = current.value.accepts.findIndex((v) => v.id === id);
      if (i !== -1) return { accept: current.value.accepts[i], index: i };

      return;
    }
    function pushAccept(value: any) {
      if (!current.value) return;

      current.value.accepts ||= [];
      value.awaitTime = 0;

      const i = current.value.accepts.findIndex((v) => v.id === value.id);
      if (i === -1) current.value.accepts.push(value) - 1;
      else current.value.accepts[i] = value;

      runAwait();
      function runAwait() {
        setTimeout(() => {
          const accept = getAccept(value.id);
          if (!accept) return;

          accept.accept.awaitTime++;
          pushAccept(accept.accept);

          if (accept.accept.awaitTime >= 30) return;
          runAwait();
        }, 1000);
      }
    }
    function removeAccept(id: string) {
      if (!current.value) return;

      const i = current.value.accepts.findIndex((v) => v.id === id);
      if (i !== -1) current.value.accepts.splice(i, 1);
    }
    function cleanAccept() {
      if (!current.value) return;
      current.value.accepts = [];
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
      cleanAccept,

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
