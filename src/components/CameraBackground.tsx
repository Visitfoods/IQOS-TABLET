import React, { useEffect, useRef, useState } from 'react';

interface CameraBackgroundProps {
  onError?: (error: string) => void;
}

const CameraBackground: React.FC<CameraBackgroundProps> = ({ onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  useEffect(() => {
    const startCamera = async () => {
      try {
        // Solicitar permissão para acessar a câmara
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment', // Usar câmara traseira em dispositivos móveis
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          } 
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraActive(true);
        }
      } catch (error) {
        console.error('Erro ao acessar a câmara:', error);
        onError?.('Não foi possível acessar a câmara. Por favor, verifique as permissões.');
      }
    };

    startCamera();

    // Limpar ao desmontar o componente
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, [onError]);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden z-0">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      {/* Overlay escuro para melhorar a visibilidade dos modelos 3D */}
      <div className="absolute inset-0 bg-black/30" />
    </div>
  );
};

export default CameraBackground; 