import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Environment } from '@react-three/drei';
import ModelThreeViewer from './ModelThreeViewer';
import { motion } from 'framer-motion';
import CameraBackground from './CameraBackground';

interface ModelInfo {
  id: number;
  file: string;
  name: string;
}

interface ModelCarouselProps {
  models: ModelInfo[];
}

function getIndexInCircle(length: number, index: number): number {
  return ((index % length) + length) % length;
}

const MODELS: ModelInfo[] = [
  { id: 1, file: "IQOS_ILUMA_I_BREEZE.glb", name: "IQOS ILUMA I BREEZE" },
  { id: 2, file: "IQOS_ILUMA_I_ONE_BREEZE.glb", name: "IQOS ILUMA I ONE BREEZE" },
  { id: 3, file: "IQOS_ILUMA_I_PRIME_BREEZE.glb", name: "IQOS ILUMA I PRIME BREEZE" },
];

/**
 * Componente de carrossel para exibir modelos 3D IQOS 
 * Implementa um carrossel de 3 posições com animação smooth e profundidade
 */
const ModelCarousel: React.FC<ModelCarouselProps> = ({ models }) => {
  const validModels = models.length >= 3 ? models : MODELS;
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Estados para controlar os modelos e animações
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev' | null>(null);
  
  // Inicializar corretamente as posições dos modelos
  const [modelIndices, setModelIndices] = useState({
    left: getIndexInCircle(validModels.length, -1),
    center: 0,
    right: getIndexInCircle(validModels.length, 1)
  });
  
  const animationDuration = 1500; // Aumentar duração para animação circular mais suave

  // Posições para os diferentes slots do carrossel (formação triangular)
  const positionSpecs = {
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
  };

  // Função para ir ao próximo modelo (rotação para a esquerda)
  const goNext = useCallback(() => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setDirection('next');
    
    // Aguardar a animação terminar antes de atualizar índices
    setTimeout(() => {
      // Atualizar índices após a animação
      const newCenterIndex = modelIndices.right;
      const newRightIndex = getIndexInCircle(validModels.length, modelIndices.right + 1);
      const newLeftIndex = modelIndices.center;
      
      setActiveIndex(newCenterIndex);
      setModelIndices({
        left: newLeftIndex,
        center: newCenterIndex,
        right: newRightIndex
      });
      
      setIsAnimating(false);
      setDirection(null);
    }, animationDuration);
  }, [isAnimating, validModels.length, modelIndices, animationDuration]);

  // Função para ir ao modelo anterior (rotação para a direita)
  const goPrev = useCallback(() => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setDirection('prev');
    
    // Aguardar a animação terminar antes de atualizar índices
    setTimeout(() => {
      // Atualizar índices após a animação
      const newCenterIndex = modelIndices.left;
      const newLeftIndex = getIndexInCircle(validModels.length, modelIndices.left - 1);
      const newRightIndex = modelIndices.center;
      
      setActiveIndex(newCenterIndex);
      setModelIndices({
        left: newLeftIndex,
        center: newCenterIndex,
        right: newRightIndex
      });
      
      setIsAnimating(false);
      setDirection(null);
    }, animationDuration);
  }, [isAnimating, validModels.length, modelIndices, animationDuration]);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background da câmara */}
      <CameraBackground />
      
      {/* Canvas 3D */}
      <Canvas
        className="absolute inset-0"
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 1, 20], fov: 45 }}
      >
        <PerspectiveCamera makeDefault position={[0, 1, 20]} />
        
        {/* Iluminação */}
        <ambientLight intensity={3.0} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <spotLight
          position={[-5, 5, -5]}
          angle={0.3}
          penumbra={0.5}
          intensity={1.5}
          castShadow
        />
        <pointLight position={[0, 5, 0]} intensity={1.5} />
        
        {/* Luzes específicas para os modelos laterais */}
        <spotLight
          position={[-8, 3, -10]}
          angle={0.4}
          penumbra={0.6}
          intensity={1.2}
          castShadow
        />
        <spotLight
          position={[8, 3, -10]}
          angle={0.4}
          penumbra={0.6}
          intensity={1.2}
          castShadow
        />
        
        {/* Modelos 3D */}
        <ModelThreeViewer
          modelPath="IQOS_ILUMA_I_ONE_BREEZE.glb"
          slidePosition={direction === 'next' ? 'toRight' : direction === 'prev' ? 'toCenter' : 'left'}
          isActive={slidePosition === 'center'}
          animationDuration={1500}
        />
        <ModelThreeViewer
          modelPath="IQOS_ILUMA_I_PRIME_BREEZE.glb"
          slidePosition={direction === 'next' ? 'toLeft' : direction === 'prev' ? 'toRight' : 'right'}
          isActive={slidePosition === 'right' || slidePosition === 'toRight'}
          animationDuration={1500}
        />
        <ModelThreeViewer
          modelPath="IQOS_ILUMA_I_BREEZE.glb"
          slidePosition={direction === 'next' ? 'toCenter' : direction === 'prev' ? 'toLeft' : 'left'}
          isActive={slidePosition === 'left' || slidePosition === 'toLeft'}
          animationDuration={1500}
        />
        
        {/* Ambiente */}
        <Environment preset="city" />
      </Canvas>
      
      {/* Botões de navegação */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 z-10">
        <button
          onClick={goPrev}
          className="px-6 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
        >
          Anterior
        </button>
        <button
          onClick={goNext}
          className="px-6 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
        >
          Próximo
        </button>
      </div>

      {/* Nome do modelo ativo */}
      <motion.div
        className="absolute top-12 inset-x-0 text-center z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        key={modelIndices.center}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <h1 className="text-white text-4xl font-bold tracking-wide">{validModels[modelIndices.center].name}</h1>
      </motion.div>

      {/* Texto explicativo */}
      <div className="absolute bottom-28 inset-x-0 text-center text-white text-sm opacity-70">
        Explore os modelos 3D dos dispositivos IQOS
      </div>
    </div>
  );
};

export default ModelCarousel; 