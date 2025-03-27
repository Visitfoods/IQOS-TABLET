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

/**
 * Componente que exibe modelos 3D dos IQOS
 * com fallback para cubos em caso de erro
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
  
  // Definir cores diferentes para cada modelo (usado no fallback)
  const getModelColor = () => {
    if (modelPath.includes("PRIME")) return "#ff6b6b";  // Vermelho para PRIME
    if (modelPath.includes("ONE")) return "#4ecdc4";    // Turquesa para ONE
    return "#ffbe0b";                                  // Amarelo para padrão/BREEZE
  };
  
  // Usar caminho local para os modelos
  const modelUrl = `/3DMODELS/${modelPath}`;
  
  // Carregar o modelo 3D
  const { scene } = useGLTF(modelUrl);
  
  // Processar o modelo após o carregamento com tratamento de erro
  useEffect(() => {
    if (!scene) {
      setHasError(true);
      return;
    }
    
    try {
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
    } catch (error) {
      console.error('Erro ao processar o modelo:', error);
      setHasError(true);
    }
  }, [scene, isActive, opacity, modelPath]);
  
  // Pré-carregar modelo para melhorar performance
  useEffect(() => {
    useGLTF.preload(modelUrl);
    
    // Capturar erro caso o modelo não seja carregado
    const onError = () => {
      console.error(`Erro ao carregar modelo ${modelPath}`);
      setHasError(true);
    };
    
    window.addEventListener('error', onError, { once: true });
    
    return () => {
      window.removeEventListener('error', onError);
    };
  }, [modelUrl, modelPath]);
  
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
        <Box args={[1, 1.5, 0.6]}>
          <meshStandardMaterial 
            color={isActive ? getModelColor() : "#6c757d"} 
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