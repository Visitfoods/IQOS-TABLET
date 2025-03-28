import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Environment } from '@react-three/drei';
import ModelThreeViewer from './ModelThreeViewer';
import { motion } from 'framer-motion';

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
  
  const animationDuration = 800; // Duração da animação

  // Posições para os diferentes slots do carrossel
  const positionSpecs = {
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
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black" ref={canvasRef}>
        <Canvas shadows frameloop="always">
          <PerspectiveCamera makeDefault position={[0, 2, 20]} />
          <ambientLight intensity={0.6} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.2} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={0.4} />

          {/* MODELO ESQUERDO */}
          <ModelThreeViewer
            key={`model-${modelIndices.left}`}
            modelPath={validModels[modelIndices.left].file}
            isActive={false}
            slidePosition={direction === 'next' ? 'toRight' : direction === 'prev' ? 'toCenter' : 'left'}
            animationDuration={animationDuration}
          />
          
          {/* MODELO CENTRAL - ATIVO */}
          <ModelThreeViewer
            key={`model-${modelIndices.center}`}
            modelPath={validModels[modelIndices.center].file}
            isActive={true}
            slidePosition={direction === 'next' ? 'toLeft' : direction === 'prev' ? 'toRight' : 'center'}
            animationDuration={animationDuration}
          />
          
          {/* MODELO DIREITO */}
          <ModelThreeViewer
            key={`model-${modelIndices.right}`}
            modelPath={validModels[modelIndices.right].file}
            isActive={false}
            slidePosition={direction === 'next' ? 'toCenter' : direction === 'prev' ? 'toLeft' : 'right'}
            animationDuration={animationDuration}
          />

          <Environment preset="city" />
        </Canvas>
      </div>

      {/* Botões de navegação */}
      <div className="absolute inset-x-0 bottom-12 flex justify-center gap-12 z-10">
        <motion.button
          onClick={goPrev}
          disabled={isAnimating}
          className="bg-white/90 text-black rounded-full p-4 shadow-xl hover:bg-white"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </motion.button>
        <motion.button
          onClick={goNext}
          disabled={isAnimating}
          className="bg-white/90 text-black rounded-full p-4 shadow-xl hover:bg-white"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>
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