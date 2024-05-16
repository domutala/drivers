// plugins/myPiniaPlugin.ts
import type { PiniaPluginContext, Pinia } from "pinia";

function SaveStore({ store, pinia }: PiniaPluginContext) {
  store.$subscribe((mutation) => {
    // console.log(mutation);
    // // react to store changes
    // console.log(`[🍍 ${mutation.storeId}]: ${mutation.type}.`);
  });

  // Note this has to be typed if you are using TS
  return { creationTime: new Date() };
}

export default defineNuxtPlugin(({ $pinia }) => {
  ($pinia as any).use(SaveStore);
});
