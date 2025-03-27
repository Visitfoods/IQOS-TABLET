import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, useGLTF } from '@react-three/drei';
import { Group, Object3D } from 'three';
import { animated } from '@react-spring/three';

interface ModelThreeViewerProps {
  modelPath: string;
  position: [number, number, number];
  scale: number;
  opacity: number;
  isActive: boolean;
  rotation?: [number, number, number];
}

// URLs temporários para modelos 3D online
const TEMP_MODEL_URLS: Record<string, string> = {
  "IQOS_ILUMA_I_BREEZE.glb": "https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf",
  "IQOS_ILUMA_I_ONE_BREEZE.glb": "https://threejs.org/examples/models/gltf/Duck/glTF/Duck.gltf", 
  "IQOS_ILUMA_I_PRIME_BREEZE.glb": "https://threejs.org/examples/models/gltf/Flower/glTF/Flower.gltf"
};

/**
 * Componente para exibir modelos 3D ou um cubo como fallback se o modelo falhar ao carregar
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
  const [hasError, setHasError] = useState(false);
  const [modelScene, setModelScene] = useState<Object3D | null>(null);
  
  // Função para capturar erros durante o carregamento do modelo
  const handleError = () => {
    console.error(`Erro ao carregar modelo ${modelPath}`);
    setHasError(true);
  };
  
  // Usar URL temporário se disponível, senão tentar o caminho local
  const modelUrl = TEMP_MODEL_URLS[modelPath] || `/3DMODELS/${modelPath}`;
  
  // Carregar o modelo 3D
  const { scene } = useGLTF(modelUrl, false);
  
  // Processar o modelo após o carregamento
  useEffect(() => {
    try {
      if (scene && !hasError) {
        const clonedScene = scene.clone();
        
        // Aplicar material com opacidade a todos os meshes
        clonedScene.traverse((child: any) => {
          if (child.isMesh) {
            child.material = child.material.clone();
            child.material.transparent = true;
            child.material.opacity = opacity;
            
            if (!isActive) {
              child.material.roughness = 0.8;
              child.material.metalness = 0.2;
            } else {
              child.material.roughness = 0.4;
              child.material.metalness = 0.6;
            }
          }
        });
        
        setModelScene(clonedScene);
      }
    } catch (error) {
      console.error('Erro ao processar o modelo:', error);
      handleError();
    }
  }, [scene, hasError, isActive, opacity, modelPath]);
  
  // Captura erros ao carregar
  useEffect(() => {
    if (!scene) {
      handleError();
    }
  }, [scene]);
  
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
      {hasError || !modelScene ? (
        // Fallback: Cubo colorido quando o modelo falha ao carregar
        <Box args={[1, 1, 1]}>
          <meshStandardMaterial 
            color={isActive ? "#61dafb" : "#285e70"} 
            transparent={true} 
            opacity={opacity} 
            roughness={isActive ? 0.4 : 0.8}
            metalness={isActive ? 0.6 : 0.2}
          />
        </Box>
      ) : (
        // Renderizar o modelo 3D carregado
        <primitive object={modelScene} />
      )}
    </animated.group>
  );
};

export default ModelThreeViewer; 