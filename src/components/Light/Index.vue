<template>
  <Environment :frames="Infinity" :resolution="128">
    <Thunder :rainEnabled="rainEnabled" />
    <Environment :background="false" files="/decals/shanghai_bund_2k.hdr" />
  </Environment>
</template>

<script setup lang="ts">
import { Environment } from "@tresjs/cientos";
import Thunder from "./Thunder.vue";

const { rainEnabled } = defineProps<{ rainEnabled: boolean }>();
</script>
