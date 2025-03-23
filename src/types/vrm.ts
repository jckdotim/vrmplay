import { VRM } from '@pixiv/three-vrm';

export interface VRMCharacter {
  vrm: VRM;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export interface FaceTrackingState {
  isTracking: boolean;
  blendShapes: Record<string, number>;
  headRotation: [number, number, number];
}

export interface CharacterMovement {
  position: [number, number, number];
  rotation: [number, number, number];
  velocity: [number, number, number];
} 