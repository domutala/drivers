<script setup lang="ts">
import type { IGroup, IVideo } from "~/models";

const props = defineProps({
  data: { type: Object as PropType<IVideo | IGroup>, required: true },
});
const router = useRouter();

function goto() {
  const name = (props.data as any).duration ? "watch-id" : "group-id";
  const replace = router.currentRoute.value.name === "search";
  router.push({ name, replace, params: { id: props.data.id } });
}
</script>

<template>
  <v-menu
    location="start bottom"
    origin="overlap"
    :close-on-content-click="false"
    open-on-hover
  >
    <template v-slot:activator="{ props }">
      <div class="ui-card" v-bind="props">
        <div class="ui-card-container">
          <div class="ui-card--main" @click="goto()">
            <v-img
              height="100%"
              :src="Strapi.buildMediaUrl(data.poster.url, 'image')"
              cover
            >
              <template v-slot:placeholder>
                <div class="d-flex align-center justify-center h-100">
                  <v-progress-circular
                    color="grey-lighten-4"
                    indeterminate
                  ></v-progress-circular>
                </div>
              </template>
            </v-img>
            <div v-if="$slots.content" class="ui-card--content">
              <slot name="content" :data="data" />
            </div>
          </div>
          <slot name="append" :data="data" />
        </div>
      </div>
    </template>

    <v-card color="background" @click="goto" min-height="290px" width="310">
      <v-img
        height="200"
        :src="Strapi.buildMediaUrl(data.poster.url, 'image')"
        cover
      >
        <template v-slot:placeholder>
          <div class="d-flex align-center justify-center h-100">
            <v-progress-circular
              color="grey-lighten-4"
              indeterminate
            ></v-progress-circular>
          </div>
        </template>
      </v-img>
      <div class="pa-3">
        {{ data.name }}
        <p>
          {{ data.description }}
        </p>
      </div>
    </v-card>
  </v-menu>
</template>

<style lang="scss">
.ui-card--main {
  width: 100%;
  background-color: rgba(var(--v-theme-on-background), 0.1);
  border-radius: 0.6em;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  box-shadow: rgba(var(--v-theme-on-background), 0.1) 0px 0px 0px 1px;
  transition: all 0.5s ease;

  &:hover {
    box-shadow: rgba(var(--v-theme-on-background), 0.3) 0px 0px 30px 0px,
      rgba(var(--v-theme-on-background), 0.1) 0px 0px 0px 2px;
  }

  .ui-card--content {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    // background: linear-gradient(
    //   180deg,
    //   rgba(130, 16, 16, 0) 0%,
    //   rgb(var(--v-theme-background)) 91%
    // );
    display: flex;
    align-items: flex-end;
  }
}
</style>
