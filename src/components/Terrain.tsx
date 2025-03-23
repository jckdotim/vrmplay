import { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';

interface TerrainProps {
  width?: number;
  height?: number;
  segments?: number;
}

export const Terrain = ({
  width = 500,
  height = 500,
  segments = 100,
}: TerrainProps) => {
  const textures = useLoader(TextureLoader, [
    '/sandyground/sandyground1_Base_Color.png',
    '/sandyground/sandyground1_Normal.png',
    '/sandyground/sandyground1_Roughness.png',
    '/sandyground/sandyground1_Ambient_Occlusion.png'
  ]);

  const [colorMap, normalMap, roughnessMap, aoMap] = textures;

  useEffect(() => {
    // Configure textures
    textures.forEach(texture => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(50, 50);
      texture.minFilter = THREE.LinearMipMapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.needsUpdate = true;
      texture.encoding = THREE.sRGBEncoding;
      texture.flipY = false;
    });

    // Cleanup function
    return () => {
      textures.forEach(texture => {
        texture.dispose();
      });
    };
  }, [textures]);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(width, height, segments, segments);
    geo.computeVertexNormals();
    return geo;
  }, [width, height, segments]);

  return (
    <mesh 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, 0, 0]} 
      receiveShadow
    >
      <primitive object={geometry} />
      <meshStandardMaterial
        map={colorMap}
        normalMap={normalMap}
        roughnessMap={roughnessMap}
        aoMap={aoMap}
        normalScale={new THREE.Vector2(1, 1)}
        roughness={0.8}
        metalness={0.1}
        wireframe={false}
        flatShading={false}
        dithering={true}
        shadowSide={THREE.FrontSide}
        transparent={false}
        opacity={1}
      />
    </mesh>
  );
}; 