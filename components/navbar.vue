<script lang="ts" setup>
const isMenuOpen = ref(false);
</script>

<template>
  <v-btn
    @click="isMenuOpen = true"
    icon
    color="background"
    style="position: fixed; top: 0; left: 15px; z-index: 2500"
    :style="{ top: `${10 + Store.app.statusBar.height}px` }"
  >
    <i class="fi fi-br-menu-burger"></i>
  </v-btn>

  <v-navigation-drawer
    temporary
    v-model="isMenuOpen"
    color="background"
    class="border-0"
    width="300"
    :style="{
      paddingTop: `${Store.app.statusBar.height}px`,
      maxWidth: '90%',
      zIndex: 2800,
    }"
  >
    <v-list-item
      prepend-avatar="https://cdn.vuetifyjs.com/images/john.png"
      class="py-3"
    >
      <template #prepend>
        <v-avatar size="42" color="primary">
          <v-icon size="42" icon="mdi-account-circle" />
        </v-avatar>
      </template>
      <template #title>
        <div style="line-height: 1">
          <div class="font-weight-bold">Mamadou</div>
          <div style="font-size: 80%">john@google.com</div>
        </div>
      </template>
      <template #append>
        <i class="fi fi-br-angle-right text-primary"></i>
      </template>
    </v-list-item>

    <v-divider></v-divider>

    <v-list-item link title="List Item 1"></v-list-item>
    <v-list-item link title="List Item 2"></v-list-item>
    <v-list-item link title="List Item 3"></v-list-item>

    <template v-slot:append>
      <div class="px-5 py-3">
        <v-btn @click="Theme.set()" class="mb-3"> theme </v-btn>
        <v-btn
          @click="
            Store.app.setMode(
              Store.app.mode === 'traveller' ? 'driver' : 'traveller'
            );
            isMenuOpen = false;
          "
          block
          rounded="pill"
          size="large"
        >
          {{
            Store.app.mode === "traveller" ? "mode conducteur" : "mode voyageur"
          }}
        </v-btn>

        <div class="d-flex align-center justify-center ga-2 mt-3">
          <v-btn icon color="dark" variant="text" size="28">
            <i class="fi fi-brands-facebook"></i>
          </v-btn>
          <v-btn icon color="dark" variant="text" size="28">
            <i class="fi fi-brands-linkedin"></i>
          </v-btn>
          <v-btn icon color="dark" variant="text" size="28">
            <i class="fi fi-brands-instagram"></i>
          </v-btn>
          <v-btn icon color="dark" variant="text" size="28">
            <i class="fi fi-brands-twitter-alt"></i>
          </v-btn>
        </div>
      </div>
    </template>
  </v-navigation-drawer>

  <div
    v-if="isMenuOpen"
    style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1003;
      opacity: 0.6;
    "
    class="bg-black"
    @click="isMenuOpen = false"
  ></div>
</template>
