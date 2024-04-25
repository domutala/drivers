<script lang="ts" setup>
import {
  AsYouType,
  getExampleNumber,
  type CountryCode,
  getCountries,
} from "libphonenumber-js";
import examples from "libphonenumber-js/mobile/examples";
import * as countryList from "countries-list";

const data = ref({ username: "", password: "" });
const countryCallingCode = ref("+212");
const countryCode = ref<CountryCode>(Store.app.details.country.toUpperCase());
const template = ref("");

onMounted(() => setCountryData(countryCode.value));

function setCountryData(code: CountryCode) {
  countryCode.value = code;
  const phoneNumber = getExampleNumber(countryCode.value, examples);
  countryCallingCode.value = phoneNumber!.countryCallingCode;

  const asYouType = new AsYouType(countryCode.value);
  asYouType.input(phoneNumber!.nationalNumber);
  template.value = asYouType.getTemplate();
}

watch(
  () => data.value.username,
  () => {
    const regex = /[^0-9]+/g;
    const result = data.value.username.replace(regex, "");
    data.value.username = new AsYouType(countryCode.value).input(result);
  }
);
</script>

<template>
  Lorem ipsum dolor, sit amet consectetur adipisicing elit. Numquam modi, at
  perspiciatis nostrum veritatis similique consequatur soluta blanditiis, ad.
  Voluptate.
  {{ Store.app.details }}

  <div class="ma-auto" style="max-width: 662px; width: 90%">
    <input type="text" maxlength="" />
    <v-text-field
      type="tel"
      rounded="pill"
      hide-details
      :placeholder="template"
      v-model="data.username"
      :maxlength="template.length"
    >
      <template #prepend-inner="{ blur }">
        <v-bottom-sheet
          :content-props="{
            style: {
              'max-height': '60lvh',
              'border-top-right-radius': '1.9em',
              'border-top-left-radius': '1.9em',
              overflow: 'hidden',
            },
          }"
        >
          <template v-slot:activator="{ props }">
            <div
              v-bind="props"
              style="font-weight: bold"
              class="ml-3 d-flex align-center"
            >
              <img
                :src="`https://flagsapi.com/${countryCode}/flat/32.png`"
                :alt="countryCode"
              />
              <!-- +{{ countryCallingCode }} -->
            </div>
            <!-- <v-btn v-bind="props" text="Click Me"></v-btn> -->
          </template>

          <template #default="{ isActive }">
            <div
              class="bg-background pa-3 border-b"
              style="position: sticky; top: 0"
            >
              <v-text-field
                rounded="pill"
                placeholder="rechercher"
                hide-details
                autofocus
              >
                <template #prepend-inner>
                  <i class="fi fi-rr-search ml-3"></i>
                </template>
              </v-text-field>
            </div>
            <v-list bg-color="background">
              <v-list-item
                v-for="(country, code) in countryList.countries"
                :key="country.name"
                :title="country.name"
                @click="
                  isActive.value = false;
                  setCountryData(code as any);
                "
              >
                <template #prepend>
                  <img
                    :src="`https://flagsapi.com/${code}/flat/32.png`"
                    :alt="code"
                    class="mr-3"
                  />
                </template>

                <template #title>
                  <div class="d-flex aliign-center ga-2">
                    {{ country.name }}
                    <div class="font-weight-bold">+{{ country.phone[0] }}</div>
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </template>
        </v-bottom-sheet>
      </template>
    </v-text-field>

    <v-text-field
      type="password"
      rounded="pill"
      placeholder="password"
      hide-details
    >
      <template #prepend-inner>
        <div style="font-weight: bold">
          <i class="fi fi-rr-lock ml-3"></i>
        </div>
      </template>
    </v-text-field>
  </div>
</template>
