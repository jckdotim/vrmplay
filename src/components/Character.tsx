import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useCharacterMovement } from '../hooks/useCharacterMovement';

interface CharacterProps {
  vrm: any;
  initialPosition?: [number, number, number];
}

export const Character = ({
  vrm,
  initialPosition = [0, 0, 0],
}: CharacterProps) => {
  const vrmRef = useRef(vrm);
  const { position, rotation } = useCharacterMovement(initialPosition);

  useEffect(() => {
    vrmRef.current = vrm;
  }, [vrm]);

  useFrame(() => {
    // Add any per-frame updates here
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