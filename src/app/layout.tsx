import "./globals.css";
import { AuthProvider } from '../lib/contexts/AuthContext';
import { DeepgramContextProvider } from '../lib/contexts/DeepgramContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body className="min-h-screen bg-gray-50">
        <AuthProvider>
          <DeepgramContextProvider>
            {children}
          </DeepgramContextProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
