<script lang="ts" setup>
const isThemodeOpen = ref(false);

async function share() {
  const url = `${import.meta.env.VITE_PUBLIC_APP_URL}`;
  Utils.share(url);
}
</script>

<template>
  <span v-if="Store.session.session.user">
    <v-menu location="bottom end" offset="5">
      <template v-slot:activator="{ props, isActive }">
        <slot name="activator" :props="props" :isActive="isActive" />
      </template>
      <v-list
        class="rounded-lg bg-background"
        style="
          box-shadow: rgba(var(--v-theme-on-background), 0.3) 0px 1px 3px -1px;
        "
      >
        <v-list-item
          @click="$router.push({ name: 'console-user-update-details' })"
        >
          <template #prepend>
            <i class="fi fi-br-user-pen mr-3" style="opacity: 0.5"></i>
          </template>
          <v-list-item-title>Modifier votre profil</v-list-item-title>
        </v-list-item>

        <v-list-item @click="share">
          <template #prepend>
            <i class="fi fi-rr-share mr-3" style="opacity: 0.5"></i>
          </template>
          <v-list-item-title>Partager</v-list-item-title>
        </v-list-item>
        <v-list-item>
          <template #prepend>
            <i class="fi fi-rr-bell mr-3" style="opacity: 0.5"></i>
          </template>
          <v-list-item-title style="opacity: 0.5">
            Notifications
          </v-list-item-title>

          <template v-slot:append>
            <v-chip variant="flat" color="info" size="x-small" class="ml-5">
              bientôt
            </v-chip>
          </template>
        </v-list-item>

        <v-list-item @click="isThemodeOpen = true">
          <template #prepend>
            <i class="fi fi-rr-palette mr-3" style="opacity: 0.5"></i>
          </template>
          <v-list-item-title>Theme</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <v-bottom-sheet
      color="background"
      bg-color="background"
      class="drvr-watch-demand--panel"
      :content-props="{
        style: {
          overflow: 'hidden',
          'max-height': '80lvh',
          'border-top-right-radius': '1.6em',
          'border-top-left-radius': '1.6em',
        },
      }"
      v-model="isThemodeOpen"
    >
      <v-card color="background">
        <v-container>
          <div class="d-flex align-center justify-center ga-2">
            <v-btn
              :variant="Store.app.mode.value === 'light' ? 'flat' : 'tonal'"
              color="dark"
              rounded="pill"
              @click="Store.app.setMode('light')"
            >
              <template #prepend>
                <i class="fi fi-sr-brightness"></i>
              </template>
              Claire</v-btn
            >
            <v-btn
              :variant="Store.app.mode.value === 'dark' ? 'flat' : 'tonal'"
              color="dark"
              rounded="pill"
              @click="Store.app.setMode('dark')"
            >
              <template #prepend>
                <i class="fi fi-sr-moon-stars"></i>
              </template>
              Sombre
            </v-btn>
            <v-btn
              :variant="!Store.app.mode.value ? 'flat' : 'tonal'"
              color="dark"
              rounded="pill"
              @click="Store.app.setMode(null)"
            >
              <template #prepend>
                <i class="fi fi-bs-computer-classic"></i>
              </template>
              Système</v-btn
            >
          </div>
        </v-container>
      </v-card>
    </v-bottom-sheet>
  </span>
</template>
