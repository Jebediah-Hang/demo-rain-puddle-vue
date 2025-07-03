<template>
  <TresMesh
    ref="lightformerRef"
    material-transparent
    :scale="[1, 2, 0.1]"
    :position="[-2, 1, -1]"
  >
    <TresBoxGeometry />
    <TresMeshBasicMaterial transparent :color="materialColor" />
  </TresMesh>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { Color, Mesh, MathUtils, MeshBasicMaterial } from "three";
import { useRenderLoop } from "@tresjs/core";
import { createNoise2D } from "simplex-noise";

const { rainEnabled } = defineProps<{ rainEnabled: boolean }>();

const lightformerRef = ref<Mesh>();

const noise = createNoise2D();
const materialColor = new Color("#8886f5").multiplyScalar(100);
const sprites = {
  thunder1: [2000, 16000],
  thunder2: [16000, 28000]
};

let thunderingDuration = -1;

watch(
  () => rainEnabled,
  () => {
    if (!rainEnabled) return;

    const getRandInterval = () => MathUtils.randInt(5000, 20000);
    const getRandSprite = () =>
      Object.keys(sprites)[MathUtils.randInt(0, Object.keys(sprites).length - 1)];

    setTimeout(() => {
      makeThunder();
    }, 5 * 1000);

    const makeThunder = () => {
      if (!rainEnabled) return;

      const sprite = <keyof typeof sprites>getRandSprite();
      const duration = sprites[sprite][1] - sprites[sprite][0];
      thunderingDuration = duration / 20;

      setTimeout(() => {
        thunderingDuration = -1;
        setTimeout(() => {
          makeThunder();
        }, getRandInterval());
      }, duration);
    };
  },
  {
    immediate: true
  }
);

const { onLoop } = useRenderLoop();
onLoop(({ clock, delta }) => {
  if (thunderingDuration > 0) {
    const time = clock.elapsedTime;
    const n = MathUtils.mapLinear(noise(0, time * 5), -1, 1, 0, 1);

    const mat = <MeshBasicMaterial>lightformerRef.value?.material;
    mat.opacity = MathUtils.smoothstep(n, 0.7, 0.95);

    thunderingDuration -= delta * 1000;
  } else {
    const mat = <MeshBasicMaterial>lightformerRef.value?.material;
    mat.opacity = 0;
  }
});
</script>
