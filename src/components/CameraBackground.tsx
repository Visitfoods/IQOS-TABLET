import React, { useEffect, useRef, useState } from 'react';

const CameraBackground: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const requestCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment', // Usar câmara traseira em dispositivos móveis
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasPermission(true);
      } catch (error) {
        console.error('Erro ao acessar a câmara:', error);
        setHasPermission(false);
      }
    };

    requestCameraPermission();

    // Cleanup
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  if (hasPermission === false) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <p>Por favor, permita o acesso à câmara para uma experiência completa.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Overlay escuro para melhorar a visibilidade dos modelos 3D */}
      <div className="absolute inset-0 bg-black/30" />
    </div>
  );
};

export default CameraBackground; 