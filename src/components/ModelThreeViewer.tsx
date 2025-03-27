import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
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
 * Componente para exibir um modelo 3D usando Three.js e React Three Fiber
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
  
  // Carregamento do modelo 3D
  const { scene } = useGLTF(`/3DMODELS/${modelPath}`);
  
  // Clone a cena para não interferir com outras instâncias
  const clonedScene = scene.clone();
  
  // Aplicar material com opacidade a todos os meshes
  clonedScene.traverse((child: any) => {
    if (child.isMesh) {
      // Clone o material para não afetar outras instâncias do mesmo modelo
      child.material = child.material.clone();
      child.material.transparent = true;
      child.material.opacity = opacity;
      
      // Adicionar um leve blur quando não está ativo (simulado com ajustes de material)
      if (!isActive) {
        child.material.roughness = 0.8;
        child.material.metalness = 0.2;
      } else {
        child.material.roughness = 0.4;
        child.material.metalness = 0.6;
      }
    }
  });

  // Animação de rotação automática se o modelo estiver ativo
  useFrame((_, delta) => {
    if (groupRef.current && isActive) {
      groupRef.current.rotation.y += delta * 0.3; // Velocidade de rotação
    }
  });

  return (
    <animated.group
      ref={groupRef}
      position={position}
      scale={[scale, scale, scale]}
      rotation={rotation}
    >
      <primitive object={clonedScene} />
    </animated.group>
  );
};

export default ModelThreeViewer; 