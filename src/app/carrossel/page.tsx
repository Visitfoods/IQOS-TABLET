'use client';

import React from 'react';
import ModelCarousel from '@/components/ModelCarousel';

/**
 * Página que exibe o carrossel de modelos 3D
 */
export default function CarrosselPage() {
  // Dados dos modelos 3D
  const models = [
    {
      id: 1,
      file: 'IQOS_ILUMA_I_BREEZE.glb',
      name: 'IQOS ILUMA I BREEZE',
    },
    {
      id: 2,
      file: 'IQOS_ILUMA_I_ONE_BREEZE.glb',
      name: 'IQOS ILUMA I ONE BREEZE',
    },
    {
      id: 3,
      file: 'IQOS_ILUMA_I_PRIME_BREEZE.glb',
      name: 'IQOS ILUMA I PRIME BREEZE',
    },
  ];

  return (
    <main>
      <ModelCarousel models={models} />
    </main>
  );
} 