'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Canvas } from '@react-three/fiber';
import ModelThreeViewer from './ModelThreeViewer';
import CameraBackground from './CameraBackground';

export default function ModelCarousel() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(1);
  const [direction, setDirection] = useState<'next' | 'prev' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [models] = useState([
    {
      id: 1,
      file: 'IQOS-ONE_Breeze.glb',
      name: 'IQOS ONE Breeze',
    },
    {
      id: 2,
      file: 'IQOS-ONE_Leaf.glb',
      name: 'IQOS ONE Leaf',
    },
    {
      id: 3,
      file: 'IQOS-ONE_Violet.glb',
      name: 'IQOS ONE Violet',
    },
    {
      id: 4,
      file: 'IQOS-ONE_Terracotta.glb',
      name: 'IQOS ONE Terracotta',
    }
  ]);

  // Função para obter os índices dos modelos visíveis
  const getVisibleModels = () => {
    const prev = (currentIndex - 1 + models.length) % models.length;
    const next = (currentIndex + 1) % models.length;
    return { prev, current: currentIndex, next };
  };

  const handleSelectModel = () => {
    router.push(`/modelo-destaque?modelo=${currentIndex}`);
  };

  const handlePrev = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setDirection('prev');
      setCurrentIndex((prev) => (prev - 1 + models.length) % models.length);
    }
  };

  const handleNext = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setDirection('next');
      setCurrentIndex((prev) => (prev + 1) % models.length);
    }
  };

  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setDirection(null);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  const getSlidePosition = (index: number) => {
    const { prev, current, next } = getVisibleModels();
    
    if (isTransitioning) {
      if (direction === 'next') {
        if (index === prev) return 'toRight';
        if (index === current) return 'toLeft';
        if (index === next) return 'toCenter';
      } else if (direction === 'prev') {
        if (index === prev) return 'toCenter';
        if (index === current) return 'toRight';
        if (index === next) return 'toLeft';
      }
    }
    
    if (index === prev) return 'left';
    if (index === current) return 'center';
    if (index === next) return 'right';
    
    return 'center';
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      <CameraBackground />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-6xl aspect-square relative">
          <Canvas 
            style={{ background: 'transparent' }}
            camera={{ position: [0, 0, 3], fov: 55 }}
          >
            {/* Iluminação principal */}
            <ambientLight intensity={2.0} />
            <directionalLight position={[0, 10, 5]} intensity={1.5} />
            
            {/* Luzes frontais */}
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={0.5} intensity={1.5} />
            <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={0.5} intensity={1.5} />
            
            {/* Luzes laterais */}
            <pointLight position={[-10, -10, -10]} intensity={1} />
            <pointLight position={[10, -10, -10]} intensity={1} />
            
            {/* Luz de preenchimento */}
            <pointLight position={[0, 0, 10]} intensity={1} />
            
            {/* Renderizar os três modelos */}
            {models.map((model, index) => (
              <ModelThreeViewer
                key={`model-${index}`}
                modelPath={model.file}
                modelName={model.file}
                isActive={index === currentIndex}
                slidePosition={getSlidePosition(index)}
                animationDuration={1500}
              />
            ))}
          </Canvas>
        </div>
        
        <div className="mt-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Modelo {currentIndex}
          </h1>
          <p className="text-xl text-white/80 mb-8">
            Explore o modelo em detalhes
          </p>
          
          <div className="flex gap-8 mb-8">
            <button
              onClick={handlePrev}
              disabled={isTransitioning}
              className="px-6 py-3 bg-white/20 text-white rounded-full text-lg font-semibold hover:bg-white/30 transition-colors duration-200"
            >
              Anterior
            </button>
            <button
              onClick={handleNext}
              disabled={isTransitioning}
              className="px-6 py-3 bg-white/20 text-white rounded-full text-lg font-semibold hover:bg-white/30 transition-colors duration-200"
            >
              Próximo
            </button>
          </div>

          <button
            onClick={handleSelectModel}
            className="px-8 py-4 bg-white text-black rounded-full text-lg font-semibold hover:bg-white/90 transition-colors duration-200 shadow-lg"
          >
            Selecionar Equipamento
          </button>
        </div>
      </div>
    </main>
  );
} 