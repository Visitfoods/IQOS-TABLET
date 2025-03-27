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
 * Componente que exibe cubos coloridos em vez de modelos 3D
 * para evitar problemas de carregamento
 */
const ModelThreeViewer: React.FC<ModelThreeViewerProps> = ({
  modelPath,
  position,
  scale,
  opacity,
  isActive,
  rotation = [0, 0, 0]
}) => {
  const groupRef = useRef<Group>(null);
  
  // Definir cores diferentes para cada modelo
  const getModelColor = () => {
    if (modelPath.includes("PRIME")) return "#ff6b6b";  // Vermelho para PRIME
    if (modelPath.includes("ONE")) return "#4ecdc4";    // Turquesa para ONE
    return "#ffbe0b";                                  // Amarelo para padrão/BREEZE
  };
  
  // Animação de rotação
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
      <Box args={[1, 1.5, 0.6]}>
        <meshStandardMaterial 
          color={isActive ? getModelColor() : "#6c757d"} 
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