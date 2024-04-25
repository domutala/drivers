<script lang="ts" setup>
const { $router } = useNuxtApp();
onMounted(() => {
  $router.replace({ name: "console" });
});
</script>
