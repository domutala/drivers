<script lang="ts" setup>
import type { ITravel } from '~/models/Travel';

const emit = defineEmits<(e: 'expired') => void>()
const props = defineProps({
  travel: { type: Object as PropType<ITravel>, required: true },
  offer: { type: Object as PropType<{ price: number, id: string, duration: number, key: string }>, required: true }
})
const timer = ref({ value: 0, percent: 0, delay: 15 });

onMounted(setDelay);
function setDelay() {
  setTimeout(() => {
    if (timer.value.value < timer.value.delay) {
      timer.value.value++;
      timer.value.percent = (timer.value.value / timer.value.delay) * 100;
      setDelay();
    } else {
      emit('expired')
    }
  }, 1000);
}

async function accept() {
  const data = await Socket.emit('travel:traveller-accept-driver', props.offer)
  Store.traveller.setCurrent(data)
}
</script>

<template>
  <div @click="" class="pa-3 py-3 d-flex align-center border-b position-relative">
    <div style="
        position: absolute;
        top: 0;
        width: 100%;
        height: 100%;
        left: 0;
        opacity: 0.5;
        border-radius: 0;
        overflow: hidden;
      ">
      <div class="bg-red" style="
          position: absolute;
          top: 0;
          height: 100%;
          width: 100%;
          opacity: 0.5;
          border-radius: inherit;
          transition: all 0.9s ease;
        " :style="{ right: `${100 - timer.percent}%` }"></div>
    </div>

    <div class="d-flex align-center justify-center ga-2 position-relative">
      <v-icon size="54" icon="mdi-account-circle" />
      <div style="line-height: 1">
        <div style="font-size: 22px">Mamadou
          <span class="text-primary ml-3 text-body-2">{{ Num.formatDuration(offer.duration) }}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 2px">
          {{ offer.price }}
          <div style="opacity: 0.5">{{ travel.price.currency }}</div>
        </div>
      </div>
    </div>

    <v-spacer />

    <v-btn rounded="pill" @click="accept">Accepter</v-btn>
  </div>
</template>