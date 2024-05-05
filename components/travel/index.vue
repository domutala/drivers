<script lang="ts" setup>
import TravelDefineRoute from "./2-define-route.vue";
import TravelSearchDriver from "./search-driver/index.vue";

onMounted(mounted);
function mounted() { }
</script>

<template>
  <travel-define-route v-if="!Store.traveller.current || !Store.traveller.current.step" />
  <span v-else-if="Store.traveller.current">
    <travel-search-driver v-if="Store.traveller.current.step === 'search_driver'" />
    <div v-else>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus, praesentium dolorum? Adipisci labore ducimus
      eligendi numquam eveniet, tempore architecto distinctio fuga quaerat minus repellendus eos accusamus quia
      mollitia, optio facilis.
    </div>
  </span>
</template>
