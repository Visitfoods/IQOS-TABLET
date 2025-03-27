import React, { useState, useEffect } from 'react';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

interface Model3DViewerProps {
  modelName: string;
  width?: string;
  height?: string;
  autoRotate?: boolean;
  exposure?: number;
}

// Adiciona a declaração de tipo para o model-viewer
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          alt?: string;
          'auto-rotate'?: boolean;
          'camera-controls'?: boolean;
          exposure?: number;
          'shadow-intensity'?: string;
          'environment-image'?: string;
        },
        HTMLElement
      >;
    }
  }
}

/**
 * Componente para visualizar modelos 3D a partir do Firebase Storage
 * 
 * Este componente carrega modelos 3D (.glb) a partir do Firebase Storage
 * e os exibe usando o elemento <model-viewer> do Google
 * 
 * @param modelName - Nome do arquivo do modelo no Firebase Storage (ex: "IQOS_ILUMA_I_BREEZE.glb")
 * @param width - Largura do visualizador (padrão: "100%")
 * @param height - Altura do visualizador (padrão: "500px")
 * @param autoRotate - Se o modelo deve girar automaticamente (padrão: true)
 * @param exposure - Exposição da luz ambiente (padrão: 1)
 */
const Model3DViewer: React.FC<Model3DViewerProps> = ({
  modelName,
  width = "100%",
  height = "500px",
  autoRotate = true,
  exposure = 1
}) => {
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Função para carregar o URL do modelo do Firebase Storage
    const loadModelFromFirebase = async () => {
      try {
        setIsLoading(true);
        const storage = getStorage();
        const modelRef = ref(storage, `models/${modelName}`);
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

  // Carrega o script do model-viewer se necessário
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
    script.type = 'module';
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center" style={{ width, height }}>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (error) {
    return <div className="flex justify-center items-center text-red-500" style={{ width, height }}>
      {error}
    </div>;
  }

  return (
    <model-viewer
      src={modelUrl || ''}
      alt={`Modelo 3D ${modelName}`}
      style={{ width, height }}
      auto-rotate={autoRotate}
      camera-controls
      exposure={exposure}
      shadow-intensity="1"
      environment-image="neutral"
    >
      <div slot="progress-bar" className="progress-bar">
        <div className="update-bar"></div>
      </div>
    </model-viewer>
  );
};

export default Model3DViewer; 