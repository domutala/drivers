import app from "~/store/app";
import session from "~/store/session";
import position from "~/store/position";
import type { PiniaPluginContext } from "pinia";
import { Preferences } from "@capacitor/preferences";
class Store {
  get app() {
    return app();
  }
  get session() {
    return session();
  }
  get position() {
    return position();
  }
}

const store = new Store();
export default store;

export async function beforeRestore(ctx: PiniaPluginContext) {
  ctx.store.$subscribe(async (mutation) => {
    const state = store[ctx.store.$id as "session"].$state;
    await Preferences.set({
      key: ctx.store.$id,
      value: JSON.stringify(state),
    });
  });

  const value = await Preferences.get({ key: ctx.store.$id });
  if (value.value) {
    sessionStorage.setItem(ctx.store.$id, value.value);
  }
}
