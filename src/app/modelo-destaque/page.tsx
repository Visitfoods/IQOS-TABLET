'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ModelThreeViewer from '@/components/ModelThreeViewer';
import CameraBackground from '@/components/CameraBackground';

export default function ModeloDestaque() {
  const searchParams = useSearchParams();
  const [modeloAtual, setModeloAtual] = useState(0);
  const [modelos] = useState([
    '/3DMODELS/modelo1.glb',
    '/3DMODELS/modelo2.glb',
    '/3DMODELS/modelo3.glb'
  ]);

  useEffect(() => {
    const modeloIndex = parseInt(searchParams.get('modelo') || '0');
    if (!isNaN(modeloIndex) && modeloIndex >= 0 && modeloIndex < modelos.length) {
      setModeloAtual(modeloIndex);
    }
  }, [searchParams, modelos.length]);

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      <CameraBackground />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-4xl aspect-square relative">
          <ModelThreeViewer
            modelPath={modelos[modeloAtual]}
            isActive={true}
            position={[0, 0, 0]}
            scale={1.5}
            rotation={[0, 0, 0]}
            showControls={true}
            autoRotate={true}
            autoRotateSpeed={2}
          />
        </div>
        
        <div className="mt-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Modelo {modeloAtual + 1} em Destaque
          </h1>
          <p className="text-xl text-white/80 mb-8">
            Explore o modelo em detalhes
          </p>
        </div>
      </div>
    </main>
  );
} 