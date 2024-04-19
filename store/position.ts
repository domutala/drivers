import { defineStore } from "pinia";

export interface IPosition {
  authorized: boolean;
  current?: { lat: number; lng: number };
}

const positionStore = defineStore(
  "position",
  () => {
    const position = ref<IPosition>({ authorized: false });

    function set(value: Partial<IPosition>) {
      position.value = { ...position.value, ...value };
    }

    async function init() {
      return new Promise<void>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userPosition = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };

            set({ authorized: true, current: userPosition });
            resolve();
          },
          (error) => {
            set({ authorized: false, current: undefined });
          }
        );
      });
    }

    function clean() {
      position.value = { authorized: false };
    }

    return {
      position,
      set,
      clean,
      init,
    };
  },
  { persist: true }
);

export default positionStore;
