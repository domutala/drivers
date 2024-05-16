import { defineStore } from "pinia";
import { Geolocation } from "@capacitor/geolocation";
import { Capacitor } from "@capacitor/core";
import { beforeRestore } from "~/utils/Store";

export interface IPosition {
  authorized: boolean;
  current: { lat: number; lng: number };
}

const store = defineStore(
  "position",
  () => {
    const authorized = ref(false);
    const position = ref({ lat: 0, lng: 0 });

    function set(value: { lat: number; lng: number }) {
      position.value = { ...position.value, ...value };

      if (Store.session.inited) {
        // send position to server
        // Socket.emit("session-my-position", position.value.current);
      }
    }

    async function init() {
      authorized.value = false;

      if (Capacitor.getPlatform() !== "web") {
        const status = await Geolocation.checkPermissions();
        authorized.value = status.location === "granted";

        if (status.location !== "granted") {
          const status = await Geolocation.requestPermissions({
            permissions: ["location"],
          });
          authorized.value = status.location === "granted";
        }

        if (authorized.value) {
          const pos = await Geolocation.getCurrentPosition();
          set({ lat: pos.coords.latitude, lng: pos.coords.longitude });

          // Observer le changement de position
          Geolocation.watchPosition({}, (pos) => {
            if (pos) {
              set({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            }
          });
        }
      } else {
        return new Promise<void>(async (resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userPosition = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              authorized.value = true;
              set(userPosition);

              navigator.geolocation.watchPosition((pos) => {
                set({ lat: pos.coords.latitude, lng: pos.coords.longitude });
              });

              resolve();
            },
            () => (authorized.value = false)
          );
        });
      }
    }

    function clean() {
      position.value = { lat: 0, lng: 0 };
      authorized.value = false;
    }

    return {
      position,
      authorized,
      set,
      clean,
      init,
    };
  },
  { persist: { beforeRestore } }
);

export default store;
