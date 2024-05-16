<script lang="ts" setup>
const { $router } = useNuxtApp();
const { t } = useI18n({ useScope: "local" });
const data = ref({ code: "" });
const submitting = ref(false);
const resendCodeUntil = ref({ time: 0 });

onMounted(mounted);
function mounted() {
  if (Store.session.session.status !== "tobevalidate") {
    $router.replace({ name: "console" });
  }
}

async function submit() {
  if (submitting.value) return;
  if (data.value.code.length !== 6) return;
  submitting.value = true;

  try {
    await Store.session.validate(data.value.code);
    $router.replace({ name: "console" });
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  resendCodeUntil.value.time = 60;
  setTimeToResendCode();
});
function setTimeToResendCode() {
  if (resendCodeUntil.value.time <= 0) return;

  setTimeout(() => {
    resendCodeUntil.value.time--;
    setTimeToResendCode();
  }, 1000);
}

async function resendCode() {
  try {
    await Socket.emit("session/resend-code-validation");
    resendCodeUntil.value.time = 60;
    setTimeToResendCode();
  } finally {
  }
}
</script>

<template>
  <ui-page extend-body>
    <v-form @submit.prevent="submit" class="h-screen">
      <div
        style="width: 86%; max-width: 552px"
        class="mx-auto d-flex flex-column h-100"
      >
        <div
          class="d-flex ga-2 align-center justify-center text-center text-h4"
          style="margin-top: 70px"
        >
          <i
            class="fi fi-ss-check-circle text-success"
            style="font-size: 22px"
          ></i>

          {{ t("validation.title") }}
        </div>
        <div class="my-auto">
          <v-otp-input
            v-model="data.code"
            variant="solo"
            :length="6"
          ></v-otp-input>

          <div class="d-flex mt-3">
            <div
              v-if="resendCodeUntil.time !== 0"
              class="text-center mx-auto text-body-2"
              style="max-width: 250px"
            >
              {{
                t("validation.resendCode.in", { time: resendCodeUntil.time })
              }}
            </div>

            <v-btn
              v-else
              size="small"
              rounded="pill"
              type="submit"
              color="dark"
              variant="tonal"
              class="mx-auto"
              @click="resendCode"
            >
              {{ t("validation.resendCode.text") }}
            </v-btn>
          </div>
        </div>

        <div
          style="width: 250px; max-width: 80%"
          class="mx-auto d-flex flex-column ga-2 mb-5"
        >
          <v-btn
            size="x-large"
            rounded="pill"
            type="submit"
            :disabled="data.code.length !== 6"
            :loading="submitting"
            block
          >
            {{ t("validation.submit.text") }}
          </v-btn>

          <v-btn
            class="mx-auto"
            size="x-small"
            rounded="pill"
            color="dark"
            variant="text"
            :disabled="submitting"
            @click="$router.replace({ name: 'login' })"
          >
            <template #prepend>
              <i class="fi fi-rr-arrow-left"></i>
            </template>

            {{ t("validation.restart.text") }}
          </v-btn>
        </div>
      </div>
    </v-form>
  </ui-page>
</template>

<i18n src="./lang.json"></i18n>
