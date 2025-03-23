import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { Terrain } from './Terrain';
import { Character } from './Character';
import { useEffect, useState } from 'react';
import { loadVRM } from '../utils/vrmLoader';

export const Scene = () => {
  const [vrm, setVrm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCharacter = async () => {
      try {
        const vrmModel = await loadVRM('/models/three-vrm-girl.vrm');
        setVrm(vrmModel);
      } catch (error) {
        console.error('Error loading VRM:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCharacter();
  }, []);

  return (
    <Canvas
      shadows
      camera={{ position: [0, 3, 8], fov: 50 }}
      style={{ width: '100vw', height: '100vh' }}
    >
      <color attach="background" args={['#87ceeb']} />
      <fog attach="fog" args={['#87ceeb', 5, 50]} />
      
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      
      <Terrain />
      
      {vrm && (
        <Character
          vrm={vrm}
          initialPosition={[0, 0, 0]}
        />
      )}
      
      <Environment preset="sunset" />
    </Canvas>
  );
}; 