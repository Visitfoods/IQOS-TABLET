import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Object3D } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { animated, useSpring } from '@react-spring/three';

type SlidePositionType = 'left' | 'center' | 'right' | 'toLeft' | 'toCenter' | 'toRight';

interface ModelThreeViewerProps {
  modelPath: string;
  slidePosition: SlidePositionType;
  isActive: boolean;
  animationDuration?: number;
}

// Cache global compartilhado entre todas as instâncias do componente
const modelCacheGlobal: Record<string, Object3D> = {};

/**
 * Componente que exibe modelos 3D dos IQOS
 * com animações suaves e efeitos de profundidade
 */
const ModelThreeViewer: React.FC<ModelThreeViewerProps> = ({
  modelPath,
  slidePosition,
  isActive,
  animationDuration = 800
}) => {
  const groupRef = useRef<Group>(null);
  const [modelScene, setModelScene] = useState<Object3D | null>(null);
  const [loadingAttempted, setLoadingAttempted] = useState(false);
  
  // Definições de posição para cada slot do carrossel
  const positionSpecs = useMemo(() => ({
    // Posições estáticas
    left: { 
      position: [-5, 1, -4] as [number, number, number], 
      scale: 6, 
      opacity: 0.8
    },
    center: { 
      position: [0, 1, 0] as [number, number, number], 
      scale: 12, 
      opacity: 1.0 
    },
    right: { 
      position: [5, 1, -4] as [number, number, number], 
      scale: 6, 
      opacity: 0.8
    },
    // Posições de animação (destino da transição)
    toLeft: { 
      position: [-5, 1, -4] as [number, number, number], 
      scale: 6, 
      opacity: 0.8
    },
    toCenter: { 
      position: [0, 1, 0] as [number, number, number], 
      scale: 12, 
      opacity: 1.0 
    },
    toRight: { 
      position: [5, 1, -4] as [number, number, number], 
      scale: 6, 
      opacity: 0.8
    }
  }), []);
  
  // Determinar posição para a animação
  const targetPosition = positionSpecs[slidePosition];
  
  // Descobrir a posição inicial com base na posição final
  const getInitialPosition = () => {
    // Se for uma posição de transição (toXXX), precisamos determinar a origem
    if (slidePosition === 'toLeft') {
      return positionSpecs.center; // Vem do centro para a esquerda
    } else if (slidePosition === 'toCenter') {
      return positionSpecs.right; // Vem da direita para o centro
    } else if (slidePosition === 'toRight') {
      return positionSpecs.left; // Vem da esquerda para a direita
    }
    
    // Se não for uma transição, está em posição estática
    return positionSpecs[slidePosition];
  };
  
  const initialPosition = getInitialPosition();
  
  // Usar interpolação fluida para a animação
  const { posX, posY, posZ, scaleXYZ, opacity } = useSpring({
    from: {
      posX: initialPosition.position[0],
      posY: initialPosition.position[1],
      posZ: initialPosition.position[2],
      scaleXYZ: initialPosition.scale,
      opacity: initialPosition.opacity
    },
    to: {
      posX: targetPosition.position[0],
      posY: targetPosition.position[1],
      posZ: targetPosition.position[2],
      scaleXYZ: targetPosition.scale,
      opacity: targetPosition.opacity
    },
    config: {
      mass: 1,
      tension: 150,
      friction: 26,
      clamp: false,
      duration: animationDuration
    }
  });
  
  // URL para o modelo
  const modelUrl = `/3DMODELS/${modelPath}`;
  
  // Carregar o modelo com cache global
  useEffect(() => {
    if (loadingAttempted) return;
    setLoadingAttempted(true);
    
    // Verificar cache global primeiro
    if (modelCacheGlobal[modelPath]) {
      const cachedModel = modelCacheGlobal[modelPath].clone();
      updateModelMaterials(cachedModel);
      setModelScene(cachedModel);
      return;
    }
    
    // Carregar o modelo se não estiver em cache
    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        try {
          // Processar o modelo
          const originalScene = gltf.scene.clone();
          
          // Guardar uma cópia limpa no cache global
          modelCacheGlobal[modelPath] = originalScene.clone();
          
          // Processar e atualizar materiais
          updateModelMaterials(originalScene);
          
          // Adicionar ao componente
          setModelScene(originalScene);
        } catch (error) {
          console.error(`Erro ao processar modelo ${modelPath}:`, error);
        }
      },
      undefined,
      (error) => console.error(`Erro ao carregar modelo ${modelPath}:`, error)
    );
  }, [modelPath, modelUrl, loadingAttempted]);
  
  // Função para atualizar materiais do modelo
  const updateModelMaterials = (scene: Object3D) => {
    scene.traverse((child: any) => {
      if (child.isMesh) {
        // Clonar material para evitar compartilhamento
        child.material = child.material.clone();
        child.material.transparent = true;
        
        // Aplicar efeitos visuais baseados no status
        if (isActive) {
          child.material.roughness = 0.3;
          child.material.metalness = 0.7;
          if (child.material.emissive) {
            child.material.emissive.set(0x222222);
            child.material.emissiveIntensity = 0.2;
          }
        } else {
          child.material.roughness = 0.6;
          child.material.metalness = 0.4;
        }
        
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  };
  
  // Atualizar os materiais quando o status ativo muda
  useEffect(() => {
    if (modelScene) {
      updateModelMaterials(modelScene);
    }
  }, [isActive, modelScene]);
  
  // Aplicar rotação apenas para o modelo central ativo quando não está em animação
  useFrame(() => {
    // Rotação suave apenas para o modelo central ativo
    if (groupRef.current && isActive && slidePosition === 'center') {
      groupRef.current.rotation.y += 0.003;
    }
    
    // Atualizar a opacidade diretamente no material
    if (modelScene) {
      const opacityValue = opacity.get();
      modelScene.traverse((child: any) => {
        if (child.isMesh && child.material) {
          if (child.material.opacity !== opacityValue) {
            child.material.opacity = opacityValue;
          }
        }
      });
    }
  });

  return (
    <animated.group
      ref={groupRef}
      position-x={posX}
      position-y={posY}
      position-z={posZ}
      scale-x={scaleXYZ}
      scale-y={scaleXYZ}
      scale-z={scaleXYZ}
    >
      {modelScene && (
        <primitive 
          object={modelScene} 
          position={[0, 0, 0]}
        />
      )}
    </animated.group>
  );
};

export default ModelThreeViewer; 