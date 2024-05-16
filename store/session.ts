import { defineStore } from "pinia";
import type { ISession } from "~/models";
import { beforeRestore } from "~/utils/Store";
import { v4 as uuidv4 } from "uuid";

const store = defineStore(
  "session",
  () => {
    const inited = ref(false);
    const session = ref<Partial<ISession>>({});

    function set(value: Partial<ISession>) {
      session.value = { ...session.value, ...value };

      if (session.value.user) {
        if (session.value.user.preferences.lang !== undefined) {
          const { $i18n } = useNuxtApp();
          $i18n.setLocale(session.value.user.preferences.lang);
          Store.app.setLang(session.value.user.preferences.lang);
        }

        if (session.value.user.preferences.mode !== undefined) {
          Store.app.setMode(session.value.user.preferences.mode);
        }
      }
    }

    function setInited(value: boolean) {
      inited.value = value;
    }

    async function init() {
      if (!session.value.keys?.public) {
        const keys = Forge.generate();
        set({ keys });
      }

      if (!session.value.id) set({ id: uuidv4() });

      await Socket.connect();
      const response = await Socket.emit("session/init", {
        id: session.value.id,
        publicKey: session.value.keys?.public,
        sokcet: Socket.socket.id,
        // position: Store.position.position.current,
      });

      set({
        id: response.id,
        apiPublicKey: response.publicKey,
        user: response.user,
        status: response.status,
      });
    }

    async function login(phonenumber: string) {
      const response = await Socket.emit("session/login", {
        phonenumber: { _RSA_ENCODED_: phonenumber },
      });

      set(response);
    }

    async function validate(code: string) {
      const response = await Socket.emit("session/validate", {
        code: { _RSA_ENCODED_: code },
      });
      set(response);
    }

    const user = {
      async updatePreferences(params: { [key: string]: any }) {
        const response = await Socket.emit("user/update-preferences", params);
        set({ user: response });

        return response;
      },
    };

    function clean() {
      session.value = {};
      // Socket.connect(true);
    }

    return {
      session,
      set,

      inited,
      setInited,

      login,
      validate,

      user,

      clean,
      init,
    };
  },
  { persist: { beforeRestore } }
);

export default store;
