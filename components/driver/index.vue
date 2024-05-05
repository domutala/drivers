<script lang="ts" setup>
import watchDemand from "./watch-demand/index.vue";
</script>

<template>
  <div v-if="Store.driver.current">
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus, praesentium dolorum? Adipisci labore ducimus
    eligendi numquam eveniet, tempore architecto distinctio fuga quaerat minus repellendus eos accusamus quia
    mollitia, optio facilis.
  </div>
  <watch-demand v-else />
</template>
