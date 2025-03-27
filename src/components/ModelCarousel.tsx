import React, { useState, useEffect } from 'react';
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

// Função para obter o índice circular válido
function getIndexInCircle(length: number, index: number): number {
  return ((index % length) + length) % length;
}

// Lista de modelos para exibir no carrossel
const MODELS: ModelInfo[] = [
  { id: 1, file: "IQOS_ILUMA_I_BREEZE.glb", name: "IQOS ILUMA I BREEZE" },
  { id: 2, file: "IQOS_ILUMA_I_ONE_BREEZE.glb", name: "IQOS ILUMA I ONE BREEZE" },
  { id: 3, file: "IQOS_ILUMA_I_PRIME_BREEZE.glb", name: "IQOS ILUMA I PRIME BREEZE" },
];

/**
 * Componente de carrossel para exibir modelos 3D com animações
 * O carrossel mostra 3 modelos: um central destacado e dois laterais menores
 */
const ModelCarousel: React.FC<ModelCarouselProps> = ({ models }) => {
  // Verificar se temos modelos suficientes, senão usar os padrão
  const validModels = models.length >= 3 ? models : MODELS;
  
  // Estado para controlar o índice do modelo ativo (central)
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Estado para posição dos modelos no carrossel
  const [positions, setPositions] = useState({
    left: getIndexInCircle(validModels.length, activeIndex - 1),
    center: activeIndex,
    right: getIndexInCircle(validModels.length, activeIndex + 1),
  });

  // Estado para controlar a direção da animação
  const [direction, setDirection] = useState(0); // 0: inicial, 1: próximo, -1: anterior
  
  // Estado para detectar quando a animação está em andamento
  const [isAnimating, setIsAnimating] = useState(false);

  // Função para atualizar as posições quando o activeIndex muda
  useEffect(() => {
    setPositions({
      left: getIndexInCircle(validModels.length, activeIndex - 1),
      center: activeIndex,
      right: getIndexInCircle(validModels.length, activeIndex + 1),
    });
  }, [activeIndex, validModels.length]);

  // Função para avançar para o próximo modelo
  const goNext = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setDirection(1);
    setTimeout(() => {
      setActiveIndex(getIndexInCircle(validModels.length, activeIndex + 1));
      setDirection(0);
      setIsAnimating(false);
    }, 600); // Tempo de duração da animação
  };

  // Função para voltar ao modelo anterior
  const goPrev = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setDirection(-1);
    setTimeout(() => {
      setActiveIndex(getIndexInCircle(validModels.length, activeIndex - 1));
      setDirection(0);
      setIsAnimating(false);
    }, 600); // Tempo de duração da animação
  };

  // Posições base para os modelos
  const positionSpecs = {
    left: { position: [-3, 0, -2] as [number, number, number], scale: 0.8, opacity: 0.7 },
    center: { position: [0, 0, 0] as [number, number, number], scale: 1.2, opacity: 1 },
    right: { position: [3, 0, -2] as [number, number, number], scale: 0.8, opacity: 0.7 },
  };

  // Calcular posições conforme a direção da animação
  const getPositionSpec = (position: 'left' | 'center' | 'right') => {
    // Mover posições conforme a direção da animação
    if (direction === 1) {
      // Ir para o próximo
      if (position === 'left') return { ...positionSpecs.center };
      if (position === 'center') return { ...positionSpecs.right };
      if (position === 'right') return { ...positionSpecs.left };
    } else if (direction === -1) {
      // Ir para o anterior
      if (position === 'left') return { ...positionSpecs.right };
      if (position === 'center') return { ...positionSpecs.left };
      if (position === 'right') return { ...positionSpecs.center };
    }
    
    // Posição padrão
    return { ...positionSpecs[position] };
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900">
      <div className="absolute inset-0">
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[0, 0, 6]} />
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
          <pointLight position={[-10, -10, -10]} />
          
          {/* Modelo da esquerda */}
          <ModelThreeViewer
            modelPath={validModels[positions.left].file}
            {...getPositionSpec('left')}
            isActive={false}
          />
          
          {/* Modelo central (ativo) */}
          <ModelThreeViewer
            modelPath={validModels[positions.center].file}
            {...getPositionSpec('center')}
            isActive={true}
          />
          
          {/* Modelo da direita */}
          <ModelThreeViewer
            modelPath={validModels[positions.right].file}
            {...getPositionSpec('right')}
            isActive={false}
          />
          
          <Environment preset="sunset" />
        </Canvas>
      </div>
      
      {/* Botões de navegação */}
      <div className="absolute inset-x-0 bottom-10 flex justify-center gap-8 z-10">
        <motion.button
          onClick={goPrev}
          className="bg-white/90 text-black rounded-full p-4 shadow-lg"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          disabled={isAnimating}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </motion.button>
        
        <motion.button
          onClick={goNext}
          className="bg-white/90 text-black rounded-full p-4 shadow-lg"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          disabled={isAnimating}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>
      </div>
      
      {/* Nome do modelo ativo */}
      <motion.div 
        className="absolute top-10 inset-x-0 text-center text-white text-3xl font-bold"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        key={positions.center}
      >
        {validModels[positions.center].name}
      </motion.div>
    </div>
  );
};

export default ModelCarousel; 