<template>
  <TresMesh
    :renderOrder="1"
    :scale="0.6"
    :frustumCulled="false"
    :position="[0, 0, 0.001]"
    :rotation="[0, 0, MathUtils.degToRad(45)]"
  >
    <TresPlaneGeometry />
    <TresMeshStandardMaterial
      transparent
      polygonOffset
      v-bind="maps"
      :depthWrite="false"
      :polygonOffsetFactor="-2"
      :blending="AdditiveBlending"
    />
  </TresMesh>
  <TresMesh
    :renderOrder="1"
    :scale="0.6"
    :frustumCulled="false"
    :position="[0, 0, 0.002]"
  >
    <TresPlaneGeometry />
    <TresMeshStandardMaterial
      transparent
      polygonOffset
      v-bind="maps"
      :depthWrite="false"
      :polygonOffsetFactor="-3"
      :blending="AdditiveBlending"
    />
  </TresMesh>
</template>

<script setup lang="ts">
import { useTexture } from "@tresjs/core";
import { AdditiveBlending, MathUtils } from "three";

const maps = await useTexture({
  map: "/decals/shmpulh_4K_Albedo.jpg",
  alphaMap: "/decals/shmpulh_4K_Opacity.jpg",
  normalMap: "/decals/shmpulh_4K_Normal.jpg",
  roughnessMap: "/decals/shmpulh_4K_Roughness.jpg",
  aoMap: "/decals/shmpulh_4K_AO.jpg"
});
</script>
