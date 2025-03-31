'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ModelThreeViewer from './ModelThreeViewer';
import CameraBackground from './CameraBackground';

export default function ModelCarousel() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [models] = useState([
    '/3DMODELS/modelo1.glb',
    '/3DMODELS/modelo2.glb',
    '/3DMODELS/modelo3.glb'
  ]);

  const handleSelectModel = () => {
    router.push(`/modelo-destaque?modelo=${currentIndex}`);
  };

  const handlePrev = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex((prev) => (prev - 1 + models.length) % models.length);
    }
  };

  const handleNext = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex((prev) => (prev + 1) % models.length);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const getSlidePosition = () => {
    if (isTransitioning) {
      return 'toCenter';
    }
    return 'center';
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      <CameraBackground />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-4xl aspect-square relative">
          <ModelThreeViewer
            modelPath={models[currentIndex]}
            slidePosition={getSlidePosition()}
            isActive={true}
            animationDuration={1500}
          />
        </div>
        
        <div className="mt-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Modelo {currentIndex + 1}
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