'use client';

import React from 'react';
import ModelCarousel from '@/components/ModelCarousel';

/**
 * Página que exibe o carrossel de modelos 3D
 */
export default function CarrosselPage() {
  return (
    <main className="h-screen flex flex-col items-center justify-center bg-gray-900">
      <ModelCarousel />
    </main>
  );
} 