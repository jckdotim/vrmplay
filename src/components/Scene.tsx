import { Canvas } from '@react-three/fiber';
import { Environment, Sky, AccumulativeShadows, RandomizedLight, Html } from '@react-three/drei';
import { Terrain } from './Terrain';
import { Character } from './Character';
import { useEffect, useState, useCallback } from 'react';
import { loadVRM } from '../utils/vrmLoader';
import { VRM } from '@pixiv/three-vrm';
import { CAMERA_CONFIG } from '../constants/camera';

export const Scene = () => {
  const [vrm, setVrm] = useState<VRM | null>(null);
  const [loading, setLoading] = useState(true);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (!file) return;

    try {
      const url = URL.createObjectURL(file);
      const vrm = await loadVRM(url) as VRM;
      setVrm(vrm);
    } catch (error) {
      console.error('Error loading VRM:', error);
    }
  };

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
    <div 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden'
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Canvas
        shadows
        camera={{ 
          position: CAMERA_CONFIG.position.toArray(), 
          fov: CAMERA_CONFIG.fov 
        }}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Sky and Environment */}
        <Sky 
          distance={450000} 
          sunPosition={[0, 1, 0]} 
          inclination={0.5} 
          azimuth={0.25} 
          rayleigh={0.5} 
          turbidity={10} 
        />
        <Environment preset="sunset" background={false} />
        
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={0.5}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        
        {/* Ground Shadows */}
        <AccumulativeShadows
          temporal
          frames={100}
          alphaTest={0.85}
          opacity={0.8}
          scale={20}
          position={[0, -0.49, 0]}
        >
          <RandomizedLight
            amount={8}
            radius={4}
            intensity={1}
            ambient={0.25}
            position={[10, 10, -10]}
            bias={0.001}
            castShadow
          />
        </AccumulativeShadows>
        
        {/* Terrain */}
        <Terrain />
        
        {/* Character */}
        {vrm && (
          <Character
            vrm={vrm}
            initialPosition={[0, 0, 0]}
          />
        )}

        {/* Loading indicator */}
        {loading && (
          <Html center>
            <div style={{ color: 'white', background: 'rgba(0,0,0,0.7)', padding: '10px', borderRadius: '5px' }}>
              Loading VRM...
            </div>
          </Html>
        )}
      </Canvas>
    </div>
  );
}; 