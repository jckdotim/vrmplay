import { useMemo } from 'react';
import * as THREE from 'three';

interface TerrainProps {
  width?: number;
  height?: number;
  segments?: number;
}

export const Terrain = ({
  width = 100,
  height = 100,
  segments = 100,
}: TerrainProps) => {
  const geometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(width, height, segments, segments);
    // Add some random height variation
    const vertices = geometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
      vertices[i + 1] = Math.random() * 2 - 1; // Random height between -1 and 1
    }
    geometry.computeVertexNormals();
    return geometry;
  }, [width, height, segments]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <primitive object={geometry} />
      <meshStandardMaterial
        color="#4a4a4a"
        roughness={0.8}
        metalness={0.2}
        wireframe={false}
      />
    </mesh>
  );
}; 