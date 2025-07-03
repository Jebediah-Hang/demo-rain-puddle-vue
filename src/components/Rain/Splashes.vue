<template>
  <TresInstancedMesh
    ref="splashRef"
    :args="[null!, null!, count]"
    :frustumCulled="false"
    :renderOrder="2"
  >
    <TresPlaneGeometry :args="[0.04, 0.02]">
      <TresInstancedBufferAttribute
        attach="attributes-aSplashProgress"
        :args="[attributeArgsArray, 1]"
        :itemSize="1"
        :count="count"
      />
    </TresPlaneGeometry>
    <CustomShaderMaterial
      transparent
      :baseMaterial="MeshBasicMaterial"
      :blending="AdditiveBlending"
      :uniforms="uniforms"
      :vertexShader="vertexShader"
      :fragmentShader="fragmentShader"
    />
  </TresInstancedMesh>
  <TresGroup ref="groupRef">
    <Floor :rainProgress="rainProgress" />
  </TresGroup>
</template>

<script setup lang="ts">
import { ref, type Ref } from "vue";
import { useTexture, useRenderLoop } from "@tresjs/core";
import { CustomShaderMaterial } from "@tresjs/cientos";
import { Group, InstancedMesh, MeshBasicMaterial, AdditiveBlending } from "three";
import Floor from "@/components/Floor/Index.vue";
import { useSplashPositions } from "./useSplashPositions";

const { count = 1000, rainProgress } = defineProps<{
  count?: number;
  rainProgress: number;
}>();

const groupRef = ref<Group>();
const splashRef = ref<InstancedMesh>();
useSplashPositions(<Ref<Group>>groupRef, <Ref<InstancedMesh>>splashRef);

const attributeArgsArray = new Float32Array(count);

const vertexShader = `
attribute float aSplashProgress;

varying vec3 vPosition;
varying vec2 vUv;
varying float vSplashProgress;

void main() {
  vPosition = position;
  vUv = uv;
  vSplashProgress = aSplashProgress;

  csm_Position.y += 0.05;
}
`;
const fragmentShader = `
uniform sampler2D uFlipBook;
uniform float uRainProgress;

varying vec3 vPosition;
varying vec2 vUv;
varying float vSplashProgress;

float mapLinear(float value, float inMin, float inMax, float outMin, float outMax) {
  return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
}

float fmod(float x, float y) {
  return x - y * trunc(x / y);
}

/**
  Port unity function - Unity_Flipbook_float
  */
vec2 getFlipbookUv(
  vec2 uv,
  float width,
  float height,
  float tile,
  vec2 invert
) {
  tile = fmod(tile, width * height);
  vec2 tileCount = vec2(1.0) / vec2(width, height);
  float tileY = abs(invert.y * height - (floor(tile * tileCount.x) + invert.y * 1.0));
  float tileX = abs(invert.x * width - ((tile - width * floor(tile * tileCount.x)) + invert.x * 1.0));
  return (uv + vec2(tileX, tileY)) * tileCount;
}

void main() {
//   float progress = 0.5;
  float progress = mapLinear(vSplashProgress, 0.0, 0.3, 0.0, 1.0);
  progress = 1.0 - clamp(progress, 0.0, 1.0);

  float width = 4.0;
  float height = 5.0;
  float tiling = floor(progress * width * height);
  vec2 uv = getFlipbookUv(vUv, width, height, tiling, vec2(0.0, 1.0));
  vec4 texel = texture2D(uFlipBook, uv);

  float rainProgress = smoothstep(0.0, 0.5, uRainProgress);
  rainProgress = clamp(rainProgress, 0.0, 1.0);
  csm_DiffuseColor.a = texel.a * 0.1 * rainProgress;
}
`;

const splashFlipBook = await useTexture(["/decals/Splash.png"]);
const uniforms = ref({
  uFlipBook: { value: splashFlipBook },
  uRainProgress: { value: 0 }
});

const { onLoop } = useRenderLoop();

onLoop(() => {
  uniforms.value.uRainProgress.value = rainProgress;
});
</script>
