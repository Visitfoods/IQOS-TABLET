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
    <div className="relative w-full h-full">
      {/* Background da câmara */}
      <CameraBackground 
        onError={(error) => {
          console.error('Erro na câmara:', error);
          // Aqui você pode adicionar uma UI para mostrar o erro ao usuário
        }}
      />
      
      {/* Canvas 3D */}
      <Canvas
        className="w-full h-full"
        shadows
        camera={{ position: [0, 1, 20], fov: 45 }}
      >
        <PerspectiveCamera makeDefault position={[0, 1, 20]} />
        
        {/* Iluminação principal */}
        <ambientLight intensity={3.0} />
        
        {/* Luz principal frontal */}
        <spotLight 
          position={[0, 15, 40]} 
          angle={0.5} 
          penumbra={0.8} 
          intensity={3.5} 
          castShadow 
        />
        
        {/* Luzes laterais */}
        <spotLight 
          position={[-15, 10, 10]} 
          angle={0.6} 
          penumbra={0.8} 
          intensity={2.5} 
        />
        <spotLight 
          position={[15, 10, 10]} 
          angle={0.6} 
          penumbra={0.8} 
          intensity={2.5} 
        />
        
        {/* Luz inferior para iluminação de base */}
        <pointLight position={[0, -10, 0]} intensity={1.8} />
        
        {/* Luzes adicionais para melhor percepção de profundidade */}
        <pointLight position={[0, 5, -20]} intensity={1.5} color="#b0c0ff" />
        <pointLight position={[0, 5, 30]} intensity={1.2} color="#ffcc99" />
        
        {/* Luz para iluminar objetos que estão atrás */}
        <spotLight
          position={[0, 10, -30]}
          angle={0.8}
          penumbra={1}
          intensity={2.0}
          color="#aaccff"
        />
        
        {/* Luzes adicionais para iluminar os modelos laterais */}
        <spotLight 
          position={[-6, 5, -5]} 
          angle={0.6} 
          penumbra={0.9} 
          intensity={2.0} 
          color="#ffffff"
        />
        <spotLight 
          position={[6, 5, -5]} 
          angle={0.6} 
          penumbra={0.9} 
          intensity={2.0} 
          color="#ffffff"
        />
        
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