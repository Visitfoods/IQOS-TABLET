import React, { useState } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useAuth } from '@/lib/hooks/useAuth';

interface UploadModelProps {
  onUploadComplete?: (url: string, fileName: string) => void;
  folder?: string;
}

/**
 * Componente para fazer upload de modelos 3D para o Firebase Storage
 * 
 * @param onUploadComplete - Callback chamado quando o upload é concluído
 * @param folder - Pasta no Firebase Storage para armazenar o modelo (padrão: "models")
 */
const UploadModel: React.FC<UploadModelProps> = ({
  onUploadComplete,
  folder = "models"
}) => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      // Verifica se é um arquivo .glb
      if (selectedFile.name.endsWith('.glb')) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Por favor, selecione um arquivo .glb');
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Por favor, selecione um arquivo para fazer upload');
      return;
    }

    if (!user) {
      setError('Precisa estar autenticado para fazer upload');
      return;
    }

    try {
      setUploading(true);
      setProgress(0);
      setError(null);
      setSuccess(false);

      const storage = getStorage();
      const fileName = file.name;
      const storageRef = ref(storage, `${folder}/${fileName}`);
      
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Atualiza o progresso
          const progressValue = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setProgress(progressValue);
        },
        (error) => {
          setError('Erro ao fazer upload: ' + error.message);
          setUploading(false);
        },
        async () => {
          // Upload concluído
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setSuccess(true);
          setUploading(false);
          if (onUploadComplete) {
            onUploadComplete(downloadURL, fileName);
          }
        }
      );
    } catch (error) {
      setError('Erro ao fazer upload: ' + (error as Error).message);
      setUploading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Upload de Modelo 3D</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Selecione um arquivo .glb
        </label>
        <input
          type="file"
          accept=".glb"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-medium
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
          disabled={uploading}
        />
        {file && (
          <p className="mt-2 text-sm text-gray-600">
            Arquivo selecionado: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
          </p>
        )}
      </div>
      
      {error && (
        <div className="mb-4 p-2 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-2 bg-green-50 text-green-600 rounded-md">
          Upload concluído com sucesso!
        </div>
      )}
      
      {uploading && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1">{progress}% Concluído</p>
        </div>
      )}
      
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? 'Enviando...' : 'Fazer Upload'}
      </button>
    </div>
  );
};

export default UploadModel; 