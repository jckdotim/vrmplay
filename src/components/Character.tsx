import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useCharacterMovement } from '../hooks/useCharacterMovement';
import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { mixamoVRMRigMap } from '../utils/mixamoVRMRigMap';
import { CAMERA_CONFIG } from '../constants/camera';

interface CharacterProps {
  vrm: any;
  initialPosition?: [number, number, number];
}

export const Character = ({
  vrm,
  initialPosition = [0, 0, 0],
}: CharacterProps) => {
  const vrmRef = useRef(vrm);
  const { position, rotation, isMoving } = useCharacterMovement(initialPosition);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const idleActionRef = useRef<THREE.AnimationAction | null>(null);
  const runActionRef = useRef<THREE.AnimationAction | null>(null);
  const clockRef = useRef(new THREE.Clock());
  const transitionDuration = 0.5; // 전환 시간 (초)
  const transitionRef = useRef(0); // 현재 전환 진행도 (0: idle, 1: run)

  const loadAnimation = (url: string) => {
    return new Promise<THREE.AnimationClip>((resolve, reject) => {
      const loader = new FBXLoader();
      loader.load(
        url,
        (asset) => {
          const clip = THREE.AnimationClip.findByName(asset.animations, 'mixamo.com');
          if (!clip) {
            reject(new Error('Animation clip not found'));
            return;
          }

          const tracks: THREE.KeyframeTrack[] = [];
          const restRotationInverse = new THREE.Quaternion();
          const parentRestWorldRotation = new THREE.Quaternion();
          const _quatA = new THREE.Quaternion();
          const _vec3 = new THREE.Vector3();

          // Adjust with reference to hips height
          const mixamoHips = asset.getObjectByName('mixamorigHips');
          const vrmHips = vrm.humanoid?.getNormalizedBoneNode('hips');
          
          if (!mixamoHips || !vrmHips) {
            reject(new Error('Required bones not found'));
            return;
          }

          const motionHipsHeight = mixamoHips.position.y;
          const vrmHipsY = vrmHips.getWorldPosition(_vec3).y;
          const vrmRootY = vrm.scene.getWorldPosition(_vec3).y;
          const vrmHipsHeight = Math.abs(vrmHipsY - vrmRootY);
          const hipsPositionScale = vrmHipsHeight / motionHipsHeight;

          clip.tracks.forEach((track) => {
            const trackSplitted = track.name.split('.');
            const mixamoRigName = trackSplitted[0];
            const vrmBoneName = mixamoVRMRigMap[mixamoRigName];
            const vrmNodeName = vrm.humanoid?.getNormalizedBoneNode(vrmBoneName)?.name;
            const mixamoRigNode = asset.getObjectByName(mixamoRigName);

            if (vrmNodeName && mixamoRigNode && mixamoRigNode.parent) {
              const propertyName = trackSplitted[1];

              mixamoRigNode.getWorldQuaternion(restRotationInverse).invert();
              mixamoRigNode.parent.getWorldQuaternion(parentRestWorldRotation);

              if (track instanceof THREE.QuaternionKeyframeTrack) {
                for (let i = 0; i < track.values.length; i += 4) {
                  const flatQuaternion = track.values.slice(i, i + 4);
                  _quatA.fromArray(flatQuaternion);
                  _quatA
                    .premultiply(parentRestWorldRotation)
                    .multiply(restRotationInverse);
                  _quatA.toArray(flatQuaternion);
                  flatQuaternion.forEach((v, index) => {
                    track.values[index + i] = v;
                  });
                }

                tracks.push(
                  new THREE.QuaternionKeyframeTrack(
                    `${vrmNodeName}.${propertyName}`,
                    track.times,
                    track.values.map((v, i) => (vrm.meta?.metaVersion === '0' && i % 2 === 0 ? -v : v)),
                  ),
                );
              } else if (track instanceof THREE.VectorKeyframeTrack) {
                const value = track.values.map(
                  (v, i) => (vrm.meta?.metaVersion === '0' && i % 3 !== 1 ? -v : v) * hipsPositionScale,
                );
                tracks.push(new THREE.VectorKeyframeTrack(`${vrmNodeName}.${propertyName}`, track.times, value));
              }
            }
          });

          resolve(new THREE.AnimationClip('vrmAnimation', clip.duration, tracks));
        },
        (progress) => {
          console.log(`Loading animation ${url}:`, (progress.loaded / progress.total) * 100, '%');
        },
        reject,
      );
    });
  };

  useEffect(() => {
    vrmRef.current = vrm;

    // Reset VRM pose before applying animation
    vrm.humanoid.resetNormalizedPose();

    // Create animation mixer
    const mixer = new THREE.AnimationMixer(vrm.scene);
    mixerRef.current = mixer;

    // Load both animations
    Promise.all([
      loadAnimation('/anims/Idle.fbx'),
      loadAnimation('/anims/Slow Run.fbx'),
    ]).then(([idleClip, runClip]) => {
      // Setup idle animation
      const idleAction = mixer.clipAction(idleClip);
      idleAction.setEffectiveTimeScale(1.0);
      idleAction.setEffectiveWeight(1.0);
      idleAction.setLoop(THREE.LoopRepeat, Infinity);
      idleAction.clampWhenFinished = false;
      idleActionRef.current = idleAction;

      // Setup run animation
      const runAction = mixer.clipAction(runClip);
      runAction.setEffectiveTimeScale(1.0);
      runAction.setEffectiveWeight(0.0);
      runAction.setLoop(THREE.LoopRepeat, Infinity);
      runAction.clampWhenFinished = false;
      runActionRef.current = runAction;

      // Start both animations
      idleAction.play();
      runAction.play();

      // Reset clock
      clockRef.current.start();
      
      console.log('Animations setup complete:', {
        idle: { duration: idleClip.duration, tracks: idleClip.tracks.length },
        run: { duration: runClip.duration, tracks: runClip.tracks.length }
      });
    }).catch((error) => {
      console.error('Error loading animations:', error);
    });

    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
      }
    };
  }, [vrm]);

  useFrame((state, delta) => {
    if (mixerRef.current) {
      // Update transition progress
      const targetTransition = isMoving ? 1 : 0;
      const transitionSpeed = delta / transitionDuration;
      transitionRef.current = THREE.MathUtils.lerp(
        transitionRef.current,
        targetTransition,
        transitionSpeed
      );

      // Update animation weights
      if (idleActionRef.current && runActionRef.current) {
        idleActionRef.current.setEffectiveWeight(1 - transitionRef.current);
        runActionRef.current.setEffectiveWeight(transitionRef.current);
      }

      mixerRef.current.update(delta);
    }

    if (vrmRef.current) {
      vrmRef.current.update(delta);
    }

    // Update camera position based on character position
    const targetCameraPosition = new THREE.Vector3(
      position[0],
      position[1] + CAMERA_CONFIG.height,
      position[2] + CAMERA_CONFIG.followDistance
    );

    state.camera.position.lerp(targetCameraPosition, 0.1);
    state.camera.lookAt(new THREE.Vector3(position[0], position[1], position[2]));
  });

  return (
    <primitive
      object={vrm.scene}
      position={position}
      rotation={rotation}
      scale={[1, 1, 1]}
    />
  );
}; 