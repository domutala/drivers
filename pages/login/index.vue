<script lang="ts" setup>
import { AsYouType } from "libphonenumber-js";

const { t } = useI18n({ useScope: "local" });
const data = ref({ phonenumber: "" });
const isPhonenumberValid = ref(false);
const submitting = ref(false);

watch(() => data.value.phonenumber, reformat);
function reformat() {
  const asYouType = new AsYouType("SN");
  data.value.phonenumber = asYouType.input(data.value.phonenumber);
  isPhonenumberValid.value = asYouType.isValid();

  // template.value = asYouType.getTemplate();
}

function submit() {
  if (submitting.value) return;
  if (!isPhonenumberValid.value) return;
}
</script>

<template>
  <ui-page extend-body>
    <v-form @submit.prevent="submit" class="h-screen">
      <div
        style="width: 86%; max-width: 552px"
        class="mx-auto d-flex flex-column h-100"
      >
        <div class="text-center text-h4" style="margin-top: 70px">
          {{ t("login.title") }}
        </div>
        <div class="my-auto">
          <div class="pg-login__input">
            <input
              v-model="data.phonenumber"
              type="tel"
              maxlength="12"
              placeholder="70 700 00 00"
              style="
                height: 54px;
                width: 100%;
                font: inherit;
                font-size: 22px;
                outline: none;
                padding-left: 104px;
              "
            />
            <div
              style="
                position: absolute;
                left: 5px;
                top: 50%;
                transform: translateY(-50%);
              "
            >
              <v-btn rounded="pill" variant="tonal" color="dark" size="large">
                <template #prepend>
                  <svg-icon name="flag/sn" width="17" height="17" />
                </template>
                <div style="font-weight: bold; font-size: 16px">221</div>
              </v-btn>
            </div>
          </div>
          <div
            class="text-body-2 text-center mt-3 mx-5 mx-auto"
            style="max-width: 200px"
          >
            {{ t("login.termsOfUse.text") }}
          </div>
        </div>

        <div style="width: 250px; max-width: 80%" class="mx-auto mb-5">
          <v-btn
            size="x-large"
            rounded="pill"
            type="submit"
            :disabled="!isPhonenumberValid"
            :loading="submitting"
            block
          >
            {{ t("login.submit.text") }}
            <template #append><i class="fi fi-rr-arrow-right"></i></template>
          </v-btn>
        </div>
      </div>
    </v-form>
  </ui-page>
</template>

<style lang="scss">
.pg-login__input {
  position: relative;
  border-radius: 16em;
  background-color: rgba(var(--v-theme-on-background), 0.08);

  &:focus-within {
    background-color: rgba(var(--v-theme-on-background), 0.1);
  }
}
</style>

<i18n src="./lang.json"></i18n>
