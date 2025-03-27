import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Carrossel de Modelos 3D - IQOS TABLET',
  description: 'Visualize os modelos 3D IQOS em um carrossel interativo.',
};

export default function CarrosselLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="carrossel-layout">
      {children}
    </div>
  );
} 