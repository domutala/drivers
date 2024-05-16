<script lang="ts" setup>
const open = ref(false);
const { t } = useI18n({ useScope: "local" });

async function share() {
  const url = `${import.meta.env.VITE_PUBLIC_APP_URL}`;
  Utils.share(url);
}
</script>

<template>
  <v-menu
    v-if="Store.session.session.user"
    v-model="open"
    location="bottom end"
    offset="5"
  >
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
          <i class="fi fi-rr-user-pen mr-3" style="opacity: 0.5"></i>
        </template>
        <v-list-item-title>
          {{ t("profile.title") }}
        </v-list-item-title>
      </v-list-item>

      <v-list-item @click="share">
        <template #prepend>
          <i class="fi fi-rr-share mr-3" style="opacity: 0.5"></i>
        </template>
        <v-list-item-title>
          {{ t("share.title") }}
        </v-list-item-title>
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

      <ui-app-mode>
        <template #activator="{ props, title, current }">
          <v-list-item v-bind="props">
            <template #prepend>
              <i class="fi fi-rr-palette mr-3" style="opacity: 0.5"></i>
            </template>
            <v-list-item-title>
              <div style="line-height: 1.2">
                {{ title }}
                <div style="font-size: 80%; opacity: 0.5">
                  {{ current.name }}
                </div>
              </div>
            </v-list-item-title>
          </v-list-item>
        </template>
      </ui-app-mode>

      <ui-app-lang>
        <template #activator="{ props, title, current }">
          <v-list-item v-bind="props">
            <template #prepend>
              <svg-icon
                name="language"
                width="17"
                height="17"
                class="mr-3"
                style="opacity: 0.5"
              />
            </template>
            <v-list-item-title>
              <div style="line-height: 1.2">
                {{ title }}
                <div style="font-size: 80%; opacity: 0.5">
                  {{ current.details.name }}
                </div>
              </div>
            </v-list-item-title>
          </v-list-item>
        </template>
      </ui-app-lang>
    </v-list>
  </v-menu>
</template>

<i18n src="./lang.json"></i18n>
