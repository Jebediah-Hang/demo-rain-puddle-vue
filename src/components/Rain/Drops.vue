<template>
  <TresInstancedMesh
    ref="dropsRef"
    :args="[null!, null!, count]"
    :renderOrder="2"
    :scale="[1.6, 1, 1.6]"
  >
    <TresPlaneGeometry :args="[0.2, 0.3]" />
    <CustomShaderMaterial
      transparent
      :baseMaterial="MeshBasicMaterial"
      :blending="NormalBlending"
      :uniforms="uniforms"
      :vertexShader="vertexShader"
      :fragmentShader="fragmentShader"
    />
  </TresInstancedMesh>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Object3D, MathUtils, MeshBasicMaterial, InstancedMesh, NormalBlending } from "three";
import { useTresContext, useRenderLoop } from "@tresjs/core";
import { CustomShaderMaterial } from "@tresjs/cientos";

const { count = 1000, rainProgress } = defineProps<{
  count?: number;
  rainProgress: number;
}>();

const dropsRef = ref<InstancedMesh>();
const dummy = new Object3D();
const initialY = new Float32Array(count).fill(0);

const vertexShader = `
uniform float uTime;

varying vec3 vPosition;
varying vec2 vUv;

void main() {
  vPosition = position;
  vUv = uv;
}
`;

const fragmentShader = `
uniform float uRainProgress;
  
varying vec3 vPosition;
varying vec2 vUv;

float sdUnevenCapsule( vec2 p, float r1, float r2, float h ) {
  p.x = abs(p.x);
  float b = (r1-r2)/h;
  float a = sqrt(1.0-b*b);
  float k = dot(p,vec2(-b,a));
  if( k < 0.0 ) return length(p) - r1;
  if( k > a*h ) return length(p-vec2(0.0,h)) - r2;
  return dot(p, vec2(a,b) ) - r1;
}

float blur(float steps) {
  vec2 coord = vUv - 0.5;
  coord *= 5.0;

  // Get n droplets around this one and average their distance
  float total = 0.0;
  for (float i = 0.0; i < steps; i++) {
    float dropletDistance = sdUnevenCapsule(coord, 0.05, 0.0, 2.0);
    dropletDistance = 1.0 - smoothstep(0.0, 0.05, dropletDistance);
    total += dropletDistance;
    coord += vec2(0.0, 0.2);
  }
  return total / steps;
}

void main() {
  float dropletDistance = blur(5.0);
  float rainProgress = smoothstep(0.0, 0.5, uRainProgress);
  rainProgress = clamp(rainProgress, 0.0, 1.0);
  csm_DiffuseColor.a = dropletDistance * 0.6 * rainProgress;
}
`;

const uniforms = ref({ uRainProgress: { value: 0 } });

const { camera } = useTresContext();
const { onLoop } = useRenderLoop();

onLoop(({ delta }) => {
  for (let i = 0; i < count; i++) {
    dropsRef.value?.getMatrixAt(i, dummy.matrix);

    dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
    dummy.position.y -= delta * 2.5;

    if (dummy.position.y <= 0) {
      dummy.position.set(
        MathUtils.randFloatSpread(1),
        MathUtils.randFloat(-0.1, 2),
        MathUtils.randFloatSpread(1)
      );
      initialY[i] = dummy.position.y;
      dummy.scale.setScalar(MathUtils.randFloat(0.1, 0.5));
    }

    if (camera.value?.position) {
      dummy.rotation.y = Math.atan2(
        camera.value.position.x - dummy.position.x,
        camera.value.position.z - dummy.position.z
      );
    }

    dummy.updateMatrix();
    dropsRef.value?.setMatrixAt(i, dummy.matrix);
  }

  if (dropsRef.value) {
    dropsRef.value.instanceMatrix.needsUpdate = true;
  }
  uniforms.value.uRainProgress.value = rainProgress;
});

onMounted(() => {
  for (let i = 0; i < count; i++) {
    dummy.position.set(
      MathUtils.randFloatSpread(5),
      MathUtils.randFloat(-0.1, 5),
      MathUtils.randFloatSpread(5)
    );

    dummy.updateMatrix();
    dropsRef.value?.setMatrixAt(i, dummy.matrix);
  }
  if (dropsRef.value?.instanceMatrix) {
    dropsRef.value.instanceMatrix.needsUpdate = true;
  }
});
</script>
