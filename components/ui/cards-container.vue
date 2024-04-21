<script lang="ts" setup>
const container = ref<HTMLDivElement>();

onMounted(() => {
  addEventListener("resize", calcCardWidth);
  setTimeout(() => {
    calcCardWidth();
  }, 100);
});

onDeactivated(onDestroy);
onBeforeUnmount(onDestroy);
function onDestroy() {
  removeEventListener("resize", calcCardWidth);
}

function calcCardWidth() {
  if (!container.value) return;
  container.value.style.width = `100%`;
  const parent = container.value.parentElement!;
  const parentWidth = parent.getBoundingClientRect().width;

  if (parentWidth > 772) {
    let x = parent.getBoundingClientRect().width / 210;
    x = parseInt(x.toString());
    container.value.style.width = `${210 * x}px`;
  }
}
</script>

<template>
  <slot name="prepend" />

  <div ref="container" class="ui-cards-container">
    <slot name="prepend-inner" />

    <slot />

    <slot name="append-inner" />
  </div>

  <slot name="append" />
</template>

<style lang="scss">
.ui-cards-container {
  display: flex;
  flex-wrap: wrap;
  margin: auto;

  .ui-card {
    width: 210px;
    margin-bottom: 20px;

    > div {
      width: calc(100% - 10px);
      margin: auto;
    }

    .ui-card--main {
      height: 290px;
    }

    @media (max-width: 442px) {
      width: 50%;
    }
  }
}
</style>
