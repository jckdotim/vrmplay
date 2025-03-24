import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin } from '@pixiv/three-vrm';
import * as THREE from 'three';
import { VRM } from '@pixiv/three-vrm';

export const loadVRM = async (url: string): Promise<VRM> => {
  const loader = new GLTFLoader();
  loader.register((parser: any) => new VRMLoaderPlugin(parser));
  
  const gltf = await loader.loadAsync(url);
  const vrm = gltf.userData.vrm as VRM;
  
  // Initialize VRM
  vrm.scene.traverse((node: THREE.Object3D) => {
    if ('isMesh' in node && 'castShadow' in node && 'receiveShadow' in node) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });

  return vrm;
}; 