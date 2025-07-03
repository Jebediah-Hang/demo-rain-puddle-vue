<template>
  <TresMesh :rotation-x="-Math.PI / 2" :scale="[2, 2, 1]">
    <TresPlaneGeometry :args="[1, 1]" />
    <Suspense>
      <PuddleMaterial :rainProgress="rainProgress" />
    </Suspense>
    <Suspense>
      <Trash />
    </Suspense>
  </TresMesh>
</template>

<script setup lang="ts">
import PuddleMaterial from "./PuddleMaterial.vue";
import Trash from "./Trash.vue";

const { rainProgress } = defineProps<{ rainProgress: number }>();
</script>
