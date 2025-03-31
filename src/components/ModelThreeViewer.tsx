import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { animated, useSpring } from '@react-spring/three';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

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
  modelName: string;
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
  animationDuration = 800,
  modelName
}) => {
  const groupRef = useRef<Group>(null);
  const [modelScene, setModelScene] = useState<Group | null>(null);
  const [loadingAttempted, setLoadingAttempted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [modelRotation, setModelRotation] = useState({ x: 0, y: 0, z: 0 });
  const [previousPosition, setPreviousPosition] = useState({ x: 0, y: 0 });
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Posições para os diferentes slots do carrossel (formação triangular)
  const positionSpecs = {
    left: { 
      position: [-0.5, 0, -0.5] as [number, number, number], 
      scale: 2.5, 
      opacity: 1.0
    },
    center: { 
      position: [0, -0.2, 0] as [number, number, number], 
      scale: 5.5, 
      opacity: 1.0
    },
    right: { 
      position: [0.5, 0, -0.5] as [number, number, number], 
      scale: 2.5, 
      opacity: 1.0
    },
    toLeft: {
      position: [-0.5, 0, -0.5] as [number, number, number],
      scale: 2.5,
      opacity: 1.0
    },
    toCenter: {
      position: [0, -0.2, 0] as [number, number, number],
      scale: 5.5,
      opacity: 1.0
    },
    toRight: {
      position: [0.5, 0, -0.5] as [number, number, number],
      scale: 2.5,
      opacity: 1.0
    }
  };

  // Configurar animações com react-spring
  const { posX, posY, posZ, scaleXYZ, rotationY } = useSpring({
    from: {
      posX: positionSpecs[slidePosition].position[0],
      posY: positionSpecs[slidePosition].position[1],
      posZ: positionSpecs[slidePosition].position[2],
      scaleXYZ: positionSpecs[slidePosition].scale,
      rotationY: 0
    },
    to: async (next) => {
      // Criar uma trajetória circular contínua para todas as animações
      if (slidePosition === 'toCenter') {
        // Da direita para o centro (movimento circular suave)
        await next({
          posX: positionSpecs[slidePosition].position[0],
          posY: positionSpecs[slidePosition].position[1],
          posZ: positionSpecs[slidePosition].position[2],
          rotationY: Math.PI * 0.5, // Rotação de 180 graus
          scaleXYZ: positionSpecs[slidePosition].scale,
          config: {
            mass: 1,
            tension: 120,
            friction: 14,
            clamp: false
          }
        });
      } 
      else if (slidePosition === 'toLeft') {
        // Do centro para a esquerda (movimento circular suave)
        await next({
          posX: positionSpecs[slidePosition].position[0],
          posY: positionSpecs[slidePosition].position[1],
          posZ: positionSpecs[slidePosition].position[2],
          rotationY: -Math.PI * 0.5, // Rotação negativa de 180 graus
          scaleXYZ: positionSpecs[slidePosition].scale,
          config: {
            mass: 1,
            tension: 120,
            friction: 14,
            clamp: false
          }
        });
      }
      else if (slidePosition === 'toRight') {
        // Da esquerda para a direita (movimento circular suave)
        await next({
          posX: positionSpecs[slidePosition].position[0],
          posY: positionSpecs[slidePosition].position[1],
          posZ: positionSpecs[slidePosition].position[2],
          rotationY: Math.PI, // Rotação completa de 360 graus
          scaleXYZ: positionSpecs[slidePosition].scale,
          config: {
            mass: 1,
            tension: 120,
            friction: 14,
            clamp: false
          }
        });
      }
    },
    config: {
      mass: 1,
      tension: 120,
      friction: 14,
      clamp: false,
      duration: animationDuration
    }
  });

  // Carregar o modelo com cache global
  useEffect(() => {
    if (loadingAttempted) return;
    setLoadingAttempted(true);
    
    console.log(`Tentando carregar modelo: ${modelPath}`);
    
    // Verificar cache global primeiro
    if (modelCacheGlobal[modelPath]) {
      console.log(`Modelo encontrado no cache: ${modelPath}`);
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
          console.log(`Modelo carregado com sucesso: ${modelPath}`);
          // Processar o modelo
          const originalScene = gltf.scene.clone() as Group;
          
          // Ajustar escala e posição inicial
          originalScene.scale.set(2.0, 2.0, 2.0); // Escala base maior
          originalScene.position.set(0, 0, 0);
          
          // Guardar uma cópia limpa no cache global
          modelCacheGlobal[modelPath] = originalScene.clone();
          
          // Adicionar ao componente
          setModelScene(originalScene);
        } catch (error) {
          console.error(`Erro ao processar modelo ${modelPath}:`, error);
        }
      },
      (progress) => {
        console.log(`Progresso do carregamento ${modelPath}:`, (progress.loaded / progress.total) * 100, '%');
      },
      (error: unknown) => {
        if (error instanceof Error) {
          console.error(`Erro ao carregar modelo ${modelPath}:`, error);
          console.error('Detalhes do erro:', {
            url: modelPath,
            errorMessage: error.message,
            errorStack: error.stack
          });
        } else {
          console.error(`Erro desconhecido ao carregar modelo ${modelPath}:`, error);
        }
      }
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

  useEffect(() => {
    // Função para carregar o URL do modelo do Firebase Storage
    const loadModelFromFirebase = async () => {
      try {
        setIsLoading(true);
        const storage = getStorage();
        const modelRef = ref(storage, `3DMODELS/Colors/${modelName}`);
        const url = await getDownloadURL(modelRef);
        setModelUrl(url);
        setIsLoading(false);
      } catch (error) {
        console.error("Erro ao carregar modelo:", error);
        setError("Não foi possível carregar o modelo 3D. Por favor, tente novamente mais tarde.");
        setIsLoading(false);
      }
    };

    // Carrega o modelo
    loadModelFromFirebase();
  }, [modelName]);

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