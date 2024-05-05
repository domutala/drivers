import { defineStore } from "pinia";
import type { ITravel } from "~/models/Travel";

const store = defineStore(
  "driver",
  () => {
    const travels = ref<ITravel[]>([]);
    function push(values: ITravel[]) {
      for (const value of values) {
        let i = travels.value.findIndex((v) => v.id === value.id);
        if (i === -1) i = travels.value.push(value) - 1;
        else travels.value[i] = value;
      }
    }
    function remove(id: string) {
      const i = travels.value.findIndex((v) => v.id === id);
      if (i !== -1) travels.value.splice(i, 1);
    }


    const accept = ref<{ travel: ITravel, price: number, key: string }>();
    function setAccept(value?: { travel: ITravel, price: number, key: string }) {
      accept.value = value;

      if (value) {
        setTimeout(() => {
          if (accept.value?.travel.id === value.travel.id) {
            accept.value = undefined
          }
        }, 60000);
      }
    }

    const current = ref<ITravel>();
    function setCurrent(value?: ITravel) {
      current.value = value;
    }

    async function init() {
      travels.value = [];
      accept.value = undefined
      current.value = undefined
    }

    function clean() {
      travels.value = [];
    }

    return {
      travels,
      push,
      remove,

      accept,
      setAccept,

      current,
      setCurrent,

      clean,
      init,
    };
  },
  { persist: true }
);

export default store;
