"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Página principal que redireciona para o carrossel
 */
export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Verifica se está rodando em localhost
    const isLocalhost = window.location.hostname === 'localhost';
    const basePath = isLocalhost ? '' : '/IQOS-TABLET';
    
    router.push(`${basePath}/carrossel`);
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Bem-vindo ao Visualizador 3D IQOS Tablet</h1>
        <p>Redirecionando para o visualizador 3D...</p>
      </div>
    </main>
  );
}
