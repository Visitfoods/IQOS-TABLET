import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Object3D } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { animated, useSpring } from '@react-spring/three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

type SlidePositionType = 'left' | 'center' | 'right' | 'toLeft' | 'toCenter' | 'toRight';

interface ModelThreeViewerProps {
  modelPath: string;
  isActive: boolean;
  slidePosition?: 'left' | 'center' | 'right' | 'toLeft' | 'toCenter' | 'toRight';
  position?: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
  showControls?: boolean;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
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
  isActive,
  slidePosition = 'center',
  position = [0, 0, 0],
  scale = 1,
  rotation = [0, 0, 0],
  showControls = false,
  autoRotate = false,
  autoRotateSpeed = 1,
  animationDuration = 800
}) => {
  const groupRef = useRef<Group>(null);
  const [modelScene, setModelScene] = useState<Group | null>(null);
  const [loadingAttempted, setLoadingAttempted] = useState(false);
  const [modelRotation, setModelRotation] = useState({ x: 0, y: 0, z: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [previousPosition, setPreviousPosition] = useState({ x: 0, y: 0 });
  
  // Definições de posição para cada slot do carrossel
  const positionSpecs = useMemo(() => ({
    // Posições estáticas (formação triangular)
    left: { 
      position: [-6, 0, -15] as [number, number, number], 
      scale: 54, 
      opacity: 1.0
    },
    center: { 
      position: [0, 1, 0] as [number, number, number], 
      scale: 90, 
      opacity: 1.0 
    },
    right: { 
      position: [6, 0, -15] as [number, number, number], 
      scale: 54, 
      opacity: 1.0
    },
    // Posições de animação (destino da transição)
    toLeft: { 
      position: [-6, 0, -15] as [number, number, number], 
      scale: 54, 
      opacity: 1.0
    },
    toCenter: { 
      position: [0, 1, 0] as [number, number, number], 
      scale: 90, 
      opacity: 1.0 
    },
    toRight: { 
      position: [6, 0, -15] as [number, number, number], 
      scale: 54, 
      opacity: 1.0
    }
  }), []);
  
  // Determinar posição para a animação
  const targetPosition = positionSpecs[slidePosition];
  
  // Descobrir a posição inicial com base na posição final
  const getInitialPosition = () => {
    // Se for uma posição de transição (toXXX), precisamos determinar a origem
    if (slidePosition === 'toLeft') {
      // Trajetória em arco do centro para a esquerda
      return {
        position: [0, 1, 0] as [number, number, number],
        scale: positionSpecs.center.scale,
        opacity: positionSpecs.center.opacity
      };
    } else if (slidePosition === 'toCenter') {
      // Trajetória em arco da direita para o centro
      return {
        position: [6, 0, -15] as [number, number, number],
        scale: positionSpecs.right.scale,
        opacity: positionSpecs.right.opacity
      };
    } else if (slidePosition === 'toRight') {
      // Trajetória em arco da esquerda para a direita
      return {
        position: [-6, 0, -15] as [number, number, number],
        scale: positionSpecs.left.scale,
        opacity: positionSpecs.left.opacity
      };
    }
    
    // Se não for uma transição, está em posição estática
    return positionSpecs[slidePosition];
  };
  
  const initialPosition = getInitialPosition();
  
  // Calcular o renderOrder com base na posição
  const getRenderOrder = () => {
    // Modelo central sempre na frente
    if (slidePosition === 'center') {
      return 10;
    }
    // Modelo indo para o centro tem que ficar à frente
    if (slidePosition === 'toCenter') {
      return 8;
    }
    // Modelo central saindo
    if (slidePosition === 'toLeft' || slidePosition === 'toRight') {
      return 6;
    }
    // Modelos laterais 
    return 0;
  };
  
  // Usar interpolação fluida para a animação com trajetória circular
  const { posX, posY, posZ, scaleXYZ, opacity, rotationY } = useSpring({
    from: {
      posX: initialPosition.position[0],
      posY: initialPosition.position[1],
      posZ: initialPosition.position[2],
      scaleXYZ: initialPosition.scale,
      opacity: initialPosition.opacity,
      rotationY: 0
    },
    to: async (next) => {
      // Criar uma trajetória circular contínua para todas as animações
      if (slidePosition === 'toCenter') {
        // Da direita para o centro (movimento circular suave)
        await next({
          posX: targetPosition.position[0],
          posY: targetPosition.position[1],
          posZ: targetPosition.position[2],
          rotationY: Math.PI * 0.5, // Rotação de 180 graus
          scaleXYZ: targetPosition.scale,
          opacity: targetPosition.opacity,
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
          posX: targetPosition.position[0],
          posY: targetPosition.position[1],
          posZ: targetPosition.position[2],
          rotationY: -Math.PI * 0.5, // Rotação negativa de 180 graus
          scaleXYZ: targetPosition.scale,
          opacity: targetPosition.opacity,
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
          posX: targetPosition.position[0],
          posY: targetPosition.position[1],
          posZ: targetPosition.position[2],
          rotationY: Math.PI, // Rotação completa de 360 graus
          scaleXYZ: targetPosition.scale,
          opacity: targetPosition.opacity,
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
      tension: 120,  // Aumentado para movimento mais direto
      friction: 14,  // Reduzido para movimento mais suave
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
      const cachedModel = modelCacheGlobal[modelPath].clone() as Group;
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
          const originalScene = gltf.scene.clone() as Group;
          
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
        
        // Armazenar a cor original para referência futura
        if (child.material.color && !child.material.originalColor) {
          child.material.originalColor = child.material.color.clone();
        }
        
        // Configurações avançadas para resolver problemas de transparência
        child.material.transparent = false;
        child.material.opacity = 1.0;
        child.material.alphaTest = 0.01;  // Valor muito baixo para melhor performance
        child.material.depthWrite = true;  // Crucial: garantir que a profundidade seja gravada
        child.material.depthTest = true;   // Ativar teste de profundidade
        
        // Definir o lado do material (THREE.FrontSide é mais performático)
        child.material.side = 0; // THREE.FrontSide = 0
        
        // Desativar blending para evitar problemas de transparência
        child.material.blending = 1; // THREE.NormalBlending = 1
        
        // Melhorar a qualidade das texturas
        if (child.material.map) {
          child.material.map.anisotropy = 16;
          child.material.map.needsUpdate = true;
          child.material.needsUpdate = true;
        }
        
        // Aumentar precisão do modelo
        child.geometry.computeVertexNormals();
        
        // Aplicar efeitos visuais baseados no status
        if (isActive) {
          child.material.roughness = 0.3;
          child.material.metalness = 0.7;
          if (child.material.emissive) {
            child.material.emissive.set(0x222222);
            child.material.emissiveIntensity = 0.2;
          }
        } else {
          child.material.roughness = 0.5;
          child.material.metalness = 0.5;
        }
        
        // Configurar ordem de renderização
        child.renderOrder = slidePosition === 'center' ? 10 : 
                           (slidePosition === 'toCenter' ? 8 : 
                           (slidePosition === 'toLeft' || slidePosition === 'toRight' ? 6 : 0));
        
        child.frustumCulled = false; // Evitar que objetos "desapareçam"
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  };
  
  // Atualizar os materiais quando o status ativo muda
  useEffect(() => {
    if (modelScene) {
      updateModelMaterials(modelScene);
      
      // Definir a ordem de renderização com base na posição
      const renderOrder = getRenderOrder();
      modelScene.traverse((child: any) => {
        if (child.isMesh) {
          child.renderOrder = renderOrder;
        }
      });
    }
  }, [isActive, modelScene, slidePosition]);
  
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

    // Ajustar a velocidade e direção da rotação
    setModelRotation(prev => ({
      x: prev.x + deltaY * 0.005, // Reduzido para movimento mais suave
      y: prev.y + deltaX * 0.005, // Reduzido para movimento mais suave
      z: prev.z + (deltaX * 0.002) // Adicionar rotação em Z para mais fluidez
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

  // Componente interno que será renderizado dentro do Canvas
  const ModelContent = () => {
    // Mover o useFrame para dentro do ModelContent
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

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={3.0} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={0.5}
        intensity={2}
        castShadow
      />
      <pointLight position={[-10, -10, -10]} intensity={1.5} />
      <pointLight position={[0, 0, 10]} intensity={2} />
      <spotLight
        position={[-10, 10, -10]}
        angle={0.15}
        penumbra={0.5}
        intensity={2}
        castShadow
      />
      {showControls && (
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          autoRotate={autoRotate}
          autoRotateSpeed={autoRotateSpeed}
        />
      )}
      <ModelContent />
    </Canvas>
  );
};

export default ModelThreeViewer; 