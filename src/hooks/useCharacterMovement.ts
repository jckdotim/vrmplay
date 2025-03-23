import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';

interface MovementState {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  velocity: THREE.Vector3;
}

const MOVEMENT_SPEED = 0.1;
const ROTATION_SPEED = 0.1;
const CAMERA_OFFSET = new THREE.Vector3(0, 3, 8); // 카메라 높이와 거리 증가
const CAMERA_SMOOTHING = 0.05; // 카메라 부드러움 정도 조절
const CAMERA_ROTATION_SPEED = 0.02;
const CAMERA_HEIGHT_SPEED = 0.1;
const MIN_CAMERA_HEIGHT = 1;
const MAX_CAMERA_HEIGHT = 10;

export const useCharacterMovement = (initialPosition = [0, 0, 0]) => {
  const { camera } = useThree();
  const movementRef = useRef<MovementState>({
    position: new THREE.Vector3(...initialPosition),
    rotation: new THREE.Euler(0, Math.PI, 0),
    velocity: new THREE.Vector3(),
  });

  const [movement, setMovement] = useState<MovementState>(movementRef.current);
  const keysPressed = useRef<Set<string>>(new Set());
  const directionRef = useRef(new THREE.Vector3());
  const cameraTargetRef = useRef(new THREE.Vector3());
  const cameraAngleRef = useRef(0);
  const cameraHeightRef = useRef(CAMERA_OFFSET.y);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      keysPressed.current.add(event.key.toLowerCase());
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      keysPressed.current.delete(event.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    const updateMovement = () => {
      const keys = keysPressed.current;
      const direction = directionRef.current;
      direction.set(0, 0, 0);

      // Get camera's forward and right vectors
      const cameraForward = new THREE.Vector3();
      camera.getWorldDirection(cameraForward);
      cameraForward.y = 0; // Keep movement horizontal
      cameraForward.normalize();

      const cameraRight = new THREE.Vector3();
      cameraRight.crossVectors(new THREE.Vector3(0, 1, 0), cameraForward).normalize();

      // Calculate movement direction based on keys relative to camera
      if (keys.has('w')) direction.add(cameraForward);
      if (keys.has('s')) direction.sub(cameraForward);
      if (keys.has('a')) direction.add(cameraRight);
      if (keys.has('d')) direction.sub(cameraRight);

      // Normalize direction vector
      if (direction.lengthSq() > 0) {
        direction.normalize();
        direction.multiplyScalar(MOVEMENT_SPEED);

        // Calculate target rotation based on movement direction
        const targetRotation = Math.atan2(direction.x, direction.z) + Math.PI;
        const currentRotation = movementRef.current.rotation.y;

        // Calculate the shortest rotation direction
        let rotationDiff = targetRotation - currentRotation;
        while (rotationDiff > Math.PI) rotationDiff -= 2 * Math.PI;
        while (rotationDiff < -Math.PI) rotationDiff += 2 * Math.PI;

        // Smoothly rotate towards target
        movementRef.current.rotation.y += rotationDiff * ROTATION_SPEED;
      }

      // Update camera angle based on arrow keys
      if (keys.has('arrowright')) {
        cameraAngleRef.current -= CAMERA_ROTATION_SPEED;
      }
      if (keys.has('arrowleft')) {
        cameraAngleRef.current += CAMERA_ROTATION_SPEED;
      }

      // Update camera height based on up/down arrow keys
      if (keys.has('arrowup')) {
        cameraHeightRef.current = Math.min(cameraHeightRef.current + CAMERA_HEIGHT_SPEED, MAX_CAMERA_HEIGHT);
      }
      if (keys.has('arrowdown')) {
        cameraHeightRef.current = Math.max(cameraHeightRef.current - CAMERA_HEIGHT_SPEED, MIN_CAMERA_HEIGHT);
      }

      // Update position
      const newPosition = movementRef.current.position;
      newPosition.add(direction);

      // Update ref and state
      movementRef.current = {
        position: newPosition,
        rotation: movementRef.current.rotation,
        velocity: direction,
      };

      setMovement({ ...movementRef.current });

      // Calculate camera position based on angle and height
      const cameraOffset = new THREE.Vector3(
        Math.sin(cameraAngleRef.current) * CAMERA_OFFSET.z,
        cameraHeightRef.current,
        Math.cos(cameraAngleRef.current) * CAMERA_OFFSET.z
      );

      // Update camera position to follow character with smooth movement
      const targetCameraPosition = newPosition.clone().add(cameraOffset);
      cameraTargetRef.current.lerp(targetCameraPosition, CAMERA_SMOOTHING);
      camera.position.copy(cameraTargetRef.current);

      // Make camera look at character
      camera.lookAt(newPosition);

      animationFrameId = requestAnimationFrame(updateMovement);
    };

    animationFrameId = requestAnimationFrame(updateMovement);
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [camera]);

  return {
    position: [movement.position.x, movement.position.y, movement.position.z] as [number, number, number],
    rotation: [movement.rotation.x, movement.rotation.y, movement.rotation.z] as [number, number, number],
    velocity: [movement.velocity.x, movement.velocity.y, movement.velocity.z] as [number, number, number],
  };
}; 