<template>
  <div class="root-wapper">
    <TresCanvas>
      <OrbitControls />
      <TresPerspectiveCamera :position="[2, 1, 1]" />

      <Suspense>
        <Light :rainEnabled="running" />
      </Suspense>
      <Rain :rainProgress="rainProgress" />

      <EffectComposerPmndrs :multisampling="0">
        <BloomPmndrs
          mipmapBlur
          :intensity="0.05"
          :luminanceSmoothing="0"
          :luminanceThreshold="1"
        />
        <ToneMappingPmndrs />
      </EffectComposerPmndrs>
    </TresCanvas>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { TresCanvas } from "@tresjs/core";
import { OrbitControls } from "@tresjs/cientos";
import { EffectComposerPmndrs, BloomPmndrs, ToneMappingPmndrs } from "@tresjs/post-processing";

import Light from "@/components/Light/Index.vue";
import Rain from "@/components/Rain/Index.vue";

const running = ref<boolean>(false);
const rainProgress = ref<number>(0);

function startRain() {
  running.value = true;
  rainProgress.value = 1;
}

onMounted(() => {
  startRain();
});
</script>

<style lang="scss" scoped>
.root-wapper {
  width: 100%;
  height: 100vh;
  canvas {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    margin: 0;
    background-color: #00010b;
  }
}
</style>
