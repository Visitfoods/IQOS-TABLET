import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box } from '@react-three/drei';
import { Group } from 'three';
import { animated } from '@react-spring/three';

interface ModelThreeViewerProps {
  modelPath: string;
  position: [number, number, number];
  scale: number;
  opacity: number;
  isActive: boolean;
  rotation?: [number, number, number];
}

/**
 * Componente para exibir um cubo 3D como fallback para os modelos que não carregarem
 */
const ModelThreeViewer: React.FC<ModelThreeViewerProps> = ({
  position,
  scale,
  opacity,
  isActive,
  rotation = [0, 0, 0]
}) => {
  const groupRef = useRef<Group>(null);

  // Animação simples que rotaciona o modelo
  useFrame((_, delta) => {
    if (groupRef.current) {
      if (isActive) {
        groupRef.current.rotation.y += delta * 0.3;
      }
    }
  });

  return (
    <animated.group
      ref={groupRef}
      position={position}
      scale={[scale, scale, scale]}
      rotation={rotation}
    >
      <Box args={[1, 1, 1]}>
        <meshStandardMaterial 
          color={isActive ? "#61dafb" : "#285e70"} 
          transparent={true} 
          opacity={opacity} 
          roughness={isActive ? 0.4 : 0.8}
          metalness={isActive ? 0.6 : 0.2}
        />
      </Box>
    </animated.group>
  );
};

export default ModelThreeViewer; 