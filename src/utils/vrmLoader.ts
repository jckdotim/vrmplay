import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { VRMLoaderPlugin } from '@pixiv/three-vrm';
import * as THREE from 'three';

export const loadVRM = async (url: string): Promise<THREE.Object3D> => {
  const loader = new GLTFLoader();
  loader.register((parser: any) => new VRMLoaderPlugin(parser));
  
  const gltf = await loader.loadAsync(url);
  const vrm = gltf.userData.vrm;
  
  // Initialize VRM
  vrm.scene.traverse((node: THREE.Object3D) => {
    if ('isMesh' in node && 'castShadow' in node && 'receiveShadow' in node) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });

  return vrm;
}; 