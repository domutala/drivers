import { defineStore } from "pinia";
import type { ISession } from "~/models/Session";

const sessionStore = defineStore(
  "session",
  () => {
    const session = ref<Partial<ISession>>({});

    function set(value: Partial<ISession>) {
      session.value = { ...session.value, ...value };
    }

    async function init() {
      if (!session.value.keys) {
        const keys = Forge.generate();
        set({ keys });
      }

      await Socket.connect();
      const response = await Socket.emit("session-init", {
        publicKey: session.value.keys?.public,
        sokcet: Socket.socket.id,
      });

      set({
        id: response.id,
        apiPublicKey: response.publicKey,
        user: response.user,
      });
    }

    function clean() {
      session.value = {};
    }

    return {
      session,
      set,
      clean,
      init,
    };
  },
  { persist: true }
);

export default sessionStore;
