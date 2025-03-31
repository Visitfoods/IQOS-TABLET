import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { animated, useSpring } from '@react-spring/three';

interface ModelThreeViewerProps {
  modelPath: string;
  isActive: boolean;
  slidePosition: 'left' | 'center' | 'right' | 'toLeft' | 'toCenter' | 'toRight';
  position?: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
  showControls?: boolean;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  animationDuration?: number;
}

// Cache global para os modelos
const modelCacheGlobal: { [key: string]: Group } = {};

const ModelThreeViewer: React.FC<ModelThreeViewerProps> = ({
  modelPath,
  isActive,
  slidePosition = 'center',
  position = [0, 0, 0],
  scale = 1,
  rotation = [0, 0, 0],
  animationDuration = 800
}) => {
  const groupRef = useRef<Group>(null);
  const [modelScene, setModelScene] = useState<Group | null>(null);
  const [loadingAttempted, setLoadingAttempted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [modelRotation, setModelRotation] = useState({ x: 0, y: 0, z: 0 });
  const [previousPosition, setPreviousPosition] = useState({ x: 0, y: 0 });

  // Posições para os diferentes slots do carrossel (formação triangular)
  const positionSpecs = {
    left: { 
      position: [-6, 0, -15] as [number, number, number], 
      scale: 0.8, 
      opacity: 1.0
    },
    center: { 
      position: [0, 1, 0] as [number, number, number], 
      scale: 1.2, 
      opacity: 1.0
    },
    right: { 
      position: [6, 0, -15] as [number, number, number], 
      scale: 0.8, 
      opacity: 1.0
    },
    toLeft: {
      position: [-6, 0, -15] as [number, number, number],
      scale: 0.8,
      opacity: 1.0
    },
    toCenter: {
      position: [0, 1, 0] as [number, number, number],
      scale: 1.2,
      opacity: 1.0
    },
    toRight: {
      position: [6, 0, -15] as [number, number, number],
      scale: 0.8,
      opacity: 1.0
    }
  };

  // Configurar animações com react-spring
  const { posX, posY, posZ, scaleXYZ, rotationY } = useSpring({
    posX: positionSpecs[slidePosition].position[0],
    posY: positionSpecs[slidePosition].position[1],
    posZ: positionSpecs[slidePosition].position[2],
    scaleXYZ: positionSpecs[slidePosition].scale,
    rotationY: slidePosition === 'center' ? 0 : slidePosition === 'left' ? -0.5 : 0.5,
    config: {
      mass: 1,
      tension: 170,
      friction: 26,
      duration: animationDuration
    }
  });

  // Carregar o modelo com cache global
  useEffect(() => {
    if (loadingAttempted) return;
    setLoadingAttempted(true);
    
    // Verificar cache global primeiro
    if (modelCacheGlobal[modelPath]) {
      const cachedModel = modelCacheGlobal[modelPath].clone() as Group;
      setModelScene(cachedModel);
      return;
    }
    
    // Carregar o modelo se não estiver em cache
    const loader = new GLTFLoader();
    loader.load(
      modelPath,
      (gltf) => {
        try {
          // Processar o modelo
          const originalScene = gltf.scene.clone() as Group;
          
          // Guardar uma cópia limpa no cache global
          modelCacheGlobal[modelPath] = originalScene.clone();
          
          // Adicionar ao componente
          setModelScene(originalScene);
        } catch (error) {
          console.error(`Erro ao processar modelo ${modelPath}:`, error);
        }
      },
      undefined,
      (error) => console.error(`Erro ao carregar modelo ${modelPath}:`, error)
    );
  }, [modelPath, loadingAttempted]);

  // Função para lidar com o início do drag
  const handlePointerDown = (event: any) => {
    if (!isActive) return; // Só permite interação com o modelo ativo
    setIsDragging(true);
    setPreviousPosition({
      x: event.clientX || event.touches[0].clientX,
      y: event.clientY || event.touches[0].clientY
    });
  };

  // Função para lidar com o movimento do drag
  const handlePointerMove = (event: any) => {
    if (!isDragging || !isActive) return;

    const currentX = event.clientX || event.touches[0].clientX;
    const currentY = event.clientY || event.touches[0].clientY;

    const deltaX = currentX - previousPosition.x;
    const deltaY = currentY - previousPosition.y;

    setModelRotation(prev => ({
      x: prev.x + deltaY * 0.005,
      y: prev.y + deltaX * 0.005,
      z: prev.z + (deltaX * 0.002)
    }));

    setPreviousPosition({
      x: currentX,
      y: currentY
    });
  };

  // Função para lidar com o fim do drag
  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Adicionar event listeners para touch
  useEffect(() => {
    if (isActive) {
      window.addEventListener('touchmove', handlePointerMove);
      window.addEventListener('touchend', handlePointerUp);
      return () => {
        window.removeEventListener('touchmove', handlePointerMove);
        window.removeEventListener('touchend', handlePointerUp);
      };
    }
  }, [isActive, isDragging]);

  // Atualizar os materiais e a ordem de renderização em cada frame
  useFrame(() => {
    if (modelScene) {
      const zPos = posZ.get();
      const xPos = posX.get();
      
      // Calcular o renderOrder dinamicamente baseado na posição 3D atual
      let dynamicRenderOrder;
      
      if (slidePosition.startsWith('to')) {
        // Durante animações, calcular ordem de renderização baseada na posição Z atual
        dynamicRenderOrder = Math.floor((zPos + 20) * 2);
        
        // Ajustes específicos para diferentes animações
        if (slidePosition === 'toRight' && zPos < -10) {
          dynamicRenderOrder -= 10;
        }
        else if (slidePosition === 'toCenter' && zPos > -5) {
          dynamicRenderOrder += 15;
        }
      } 
      else {
        // Para posições estáticas (não animadas)
        if (slidePosition === 'center') {
          dynamicRenderOrder = 30; // Modelo central sempre na frente
        } else {
          // Modelos laterais ficam atrás
          dynamicRenderOrder = 10;
        }
      }
      
      // Limite para evitar valores extremos
      dynamicRenderOrder = Math.max(0, Math.min(dynamicRenderOrder, 50));
      
      modelScene.traverse((child: any) => {
        if (child.isMesh) {
          // Configurações de material para melhorar a visualização de profundidade
          child.material.transparent = false;
          child.material.opacity = 1.0;
          child.material.depthWrite = true; 
          child.material.depthTest = true;
          
          // Aumentar o contraste dos objetos que estão na frente
          if (slidePosition === 'center' || (slidePosition === 'toCenter' && zPos > -5)) {
            child.material.roughness = 0.3;
            child.material.metalness = 0.7;
          } else {
            // Diminuir brilho para objetos mais distantes, mas manter visível
            child.material.roughness = 0.4;
            child.material.metalness = 0.6;
          }
          
          // Atualizar renderOrder durante a animação
          child.renderOrder = dynamicRenderOrder;
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
      rotation-y={rotationY}
      scale-x={scaleXYZ}
      scale-y={scaleXYZ}
      scale-z={scaleXYZ}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {modelScene && (
        <primitive 
          object={modelScene} 
          position={position}
          rotation-x={isActive ? modelRotation.x : 0}
          rotation-y={isActive ? modelRotation.y : 0}
          rotation-z={isActive ? modelRotation.z : 0}
          center={[0, 0, 0]}
        />
      )}
    </animated.group>
  );
};

export default ModelThreeViewer; 