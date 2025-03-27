import React from 'react';
import Model3DViewer from '@/components/Model3DViewer';
import UploadModel from '@/components/UploadModel';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Modelos 3D - IQOS TABLET',
  description: 'Visualizador e upload de modelos 3D para o projeto IQOS TABLET',
};

export default function ModelosPage() {
  const modelos = [
    {
      id: 1,
      nome: 'IQOS ILUMA I BREEZE',
      arquivo: 'IQOS_ILUMA_I_BREEZE.glb',
      descricao: 'Modelo 3D do IQOS ILUMA I BREEZE, versão azul claro.'
    },
    {
      id: 2,
      nome: 'IQOS ILUMA I ONE BREEZE',
      arquivo: 'IQOS_ILUMA_I_ONE_BREEZE.glb',
      descricao: 'Modelo 3D do IQOS ILUMA I ONE BREEZE, versão compacta.'
    },
    {
      id: 3,
      nome: 'IQOS ILUMA I PRIME BREEZE',
      arquivo: 'IQOS_ILUMA_I_PRIME_BREEZE.glb',
      descricao: 'Modelo 3D do IQOS ILUMA I PRIME BREEZE, versão premium.'
    }
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Modelos 3D</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Upload de Modelo</h2>
          <p className="mb-4 text-gray-600">
            Utilize este formulário para fazer upload de novos modelos 3D (.glb).
            Os modelos serão armazenados no Firebase Storage e ficam disponíveis
            para visualização imediatamente após o upload.
          </p>
          <UploadModel 
            onUploadComplete={(url, fileName) => {
              console.log('Upload concluído:', url, fileName);
              // Aqui poderia adicionar o modelo à lista ou atualizar a página
            }} 
          />
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-4">Instruções</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-2">Como utilizar os modelos:</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Os modelos são visualizados diretamente do Firebase Storage</li>
              <li>Pode girar o modelo usando o mouse ou dedo na tela</li>
              <li>Use a roda do mouse para zoom in/out</li>
              <li>Clique duas vezes para centralizar o modelo</li>
            </ol>
            
            <h3 className="text-lg font-medium mt-4 mb-2">Formatos suportados:</h3>
            <ul className="list-disc pl-5">
              <li>GLB (.glb) - Formato recomendado</li>
              <li>O limite de tamanho é de 100MB por modelo</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">Modelos Disponíveis</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {modelos.map(modelo => (
            <div key={modelo.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-80">
                <Model3DViewer
                  modelName={modelo.arquivo}
                  height="320px"
                  autoRotate={true}
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold mb-2">{modelo.nome}</h3>
                <p className="text-gray-600 mb-4">{modelo.descricao}</p>
                <div className="text-sm text-gray-500">
                  Arquivo: {modelo.arquivo}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="text-lg font-medium text-blue-800 mb-2">Nota:</h3>
        <p className="text-blue-600">
          Os modelos 3D são armazenados no Firebase Storage em vez do Git LFS, 
          proporcionando melhor desempenho e controle de acesso. Esta abordagem 
          é recomendada para aplicações em produção.
        </p>
      </div>
    </div>
  );
} 