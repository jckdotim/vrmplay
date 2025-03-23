import { Vector3 } from 'three';

export const CAMERA_CONFIG = {
  position: new Vector3(0, 3, 5),
  fov: 60,
  followDistance: 5,
  height: 3,
} as const; 