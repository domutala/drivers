<script lang="ts" setup>
import type { IUser } from "~/models";

const { t } = useI18n({ useScope: "local" });
const { $router } = useNuxtApp();
const data = ref({ name: "" });
const submitting = ref(false);

onMounted(mounted);
function mounted() {
  if (Store.session.session.user) {
    data.value.name = Store.session.session.user.details.name || "";
  }
}

async function submit() {
  if (submitting.value) return;
  submitting.value = true;

  try {
  } finally {
    const response = await Socket.emit("user/update-details", data.value);

    Store.session.set({ user: response });
    submitting.value = false;
    $router.replace({ name: "console" });
  }
}
</script>

<template>
  <ui-page>
    <v-form @submit.prevent="submit">
      <div
        style="width: 80%; max-width: 552px; margin-top: 80px"
        class="mx-auto"
      >
        <v-text-field
          v-model="data.name"
          variant="solo"
          rounded="lg"
          :label="t('name')"
          :rules="[(value) => !!value || $t('error.field_required')]"
          flat
        ></v-text-field>
      </div>

      <div
        class="bg-background"
        style="
          position: fixed;
          bottom: 0;
          width: 100%;
          box-shadow: rgba(var(--v-theme-on-background), 0.07) 0px 2px 8px 0px;
        "
      >
        <div style="width: 250px; max-width: 80%" class="mx-auto my-5">
          <v-btn
            size="x-large"
            rounded="pill"
            type="submit"
            :loading="submitting"
            block
          >
            {{ t("submit") }}
          </v-btn>
        </div>
      </div>
    </v-form>
  </ui-page>
</template>

<i18n src="./update-details.lang.json"></i18n>
