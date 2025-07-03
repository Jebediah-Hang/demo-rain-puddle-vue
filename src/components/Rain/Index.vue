<template>
  <Drops :rainProgress="rainProgress" />
  <Suspense>
    <Splashes :rainProgress="rainProgress" />
  </Suspense>
</template>

<script setup lang="ts">
import Drops from "./Drops.vue";
import Splashes from "./Splashes.vue";

const { rainProgress } = defineProps<{ rainProgress: number }>();
</script>
