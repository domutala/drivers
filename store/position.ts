import { defineStore } from "pinia";
import { Geolocation } from "@capacitor/geolocation";
import { Capacitor } from "@capacitor/core";

export interface IPosition {
  authorized: boolean;
  current: { lat: number; lng: number };
}

const positionStore = defineStore(
  "position",
  () => {
    const position = ref<IPosition>({
      authorized: false,
      current: { lat: 0, lng: 0 },
    });

    function set(value: Partial<IPosition>) {
      position.value = { ...position.value, ...value };

      if (position.value.current) {
        Socket.emit("session-my-position", position.value.current);
      }
    }

    async function init() {
      if (Capacitor.getPlatform() === "android") {
        const status = await Geolocation.checkPermissions();
        if (status.location !== "granted") {
          const status = await Geolocation.requestPermissions();
          if (status.location === "granted") set({ authorized: true });
          else set({ authorized: false });
        } else set({ authorized: true });

        if (position.value.authorized) {
          const pos = await Geolocation.getCurrentPosition();
          set({
            current: {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            },
          });
        }

        if (position.value.authorized) {
          Geolocation.watchPosition({}, (pos) => {
            if (pos) {
              set({
                current: {
                  lat: pos.coords.latitude,
                  lng: pos.coords.longitude,
                },
              });
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
              set({ authorized: true, current: userPosition });

              navigator.geolocation.watchPosition((pos) => {
                set({
                  authorized: true,
                  current: {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                  },
                });
              });

              resolve();
            },
            (error) => {
              set({ authorized: false });
            }
          );
        });
      }
    }

    function clean() {
      position.value = { authorized: false, current: { lat: 0, lng: 0 } };
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
