import { onMounted, type Ref } from "vue";
import { Group, InstancedMesh, Object3D, Mesh, Vector3, InstancedBufferAttribute, MathUtils } from "three";
import { MeshSurfaceSampler } from "three-stdlib";
import { useTresContext, useRenderLoop } from "@tresjs/core";

function isMesh(obj: Object3D): obj is Mesh {
  return (<Mesh>obj).isMesh;
}

export function useSplashPositions(groupRef: Ref<Group>, instancedMeshRef: Ref<InstancedMesh>) {

  const worldSkyDirection = new Vector3(0, 1, 0);
  const samplers: Array<{ sampler: MeshSurfaceSampler; mesh: Mesh; }> = [];

  onMounted(() => {
    groupRef.value.traverse((obj) => {
      if (isMesh(obj)) {
        const mesh = obj;
        const positionAttr = mesh.geometry.getAttribute("position");
        const normalAttr = mesh.geometry.getAttribute("normal");
        const count = positionAttr.count;

        const skyWeightAttrArray = new Float32Array(count);

        for (let i = 0; i < count; i++) {
          const position = new Vector3();
          const normal = new Vector3();
          position.fromBufferAttribute(positionAttr, i);
          normal.fromBufferAttribute(normalAttr, i);

          const skyWeight = normal.dot(worldSkyDirection) >= 0 ? 1 : 0;
          skyWeightAttrArray[i] = skyWeight;
        }

        const skyWeightAttr = new InstancedBufferAttribute(skyWeightAttrArray, 1);
        mesh.geometry.setAttribute("skyWeight", skyWeightAttr);

        const sampler = new MeshSurfaceSampler(obj);
        sampler.setWeightAttribute("skyWeight");
        sampler.build();
        samplers.push({ sampler, mesh: obj });
      }
    });
  });

  const dummy = new Object3D();
  const dummyY: Array<number> = [];
  const InitialY: Array<number> = [];

  const { camera } = useTresContext();
  const { onLoop } = useRenderLoop();

  onLoop(({ delta }) => {
    if (!samplers.length) {
      return;
    }

    const instancedMesh = instancedMeshRef.value;

    const count = instancedMesh.count;
    const countPerMesh = Math.ceil(count / samplers.length);

    const progressAttr = instancedMesh.geometry.getAttribute("aSplashProgress");

    let j = 0;
    for (const { sampler, mesh } of samplers) {
      for (let i = 0; i < countPerMesh; i++) {
        instancedMesh.getMatrixAt(j, dummy.matrix);
        dummy.matrix.decompose(
          dummy.position,
          dummy.quaternion,
          dummy.scale
        );

        if (dummyY[j] === undefined) {
          dummyY[j] = 0;
          InitialY[j] = 0;
        }

        dummyY[j] -= delta * 2.5;

        if (dummyY[j] < -0.2) {
          sampler.sample(dummy.position);
          dummy.position.applyMatrix4(mesh.matrixWorld);
          dummy.position.y -= 0.04;
          dummyY[j] = MathUtils.randFloat(-0.1, 2);
          InitialY[j] = dummyY[j];
          dummy.scale.x = MathUtils.randFloat(0.5, 1);
        }

        const progress = MathUtils.mapLinear(
          dummyY[j],
          InitialY[j],
          -0.2,
          1,
          0
        );

        progressAttr.setX(j, progress);

        if (camera.value?.position) {
          dummy.rotation.y = Math.atan2(
            camera.value.position.x - dummy.position.x,
            camera.value.position.z - dummy.position.z
          );
        }

        dummy.updateMatrix();
        instancedMesh.setMatrixAt(j, dummy.matrix);
        j++;
      }
    }

    instancedMesh.instanceMatrix.needsUpdate = true;
    progressAttr.needsUpdate = true;
  });
}
