import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '../lib/contexts/AuthContext'
import { DeepgramContextProvider } from '../lib/contexts/DeepgramContext'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'IQOS TABLET',
  description: 'Aplicação IQOS TABLET com recursos avançados',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt">
      <body className={inter.className}>
        <AuthProvider>
          <DeepgramContextProvider>
            <header className="bg-gray-800 text-white p-4">
              <nav className="flex items-center justify-between">
                <div className="font-bold text-xl">IQOS TABLET</div>
                <ul className="flex space-x-4">
                  <li>
                    <Link
                      href="/"
                      className="hover:text-blue-400 transition-colors"
                    >
                      Início
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/modelos"
                      className="hover:text-blue-400 transition-colors"
                    >
                      Modelos 3D
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/notas"
                      className="hover:text-blue-400 transition-colors"
                    >
                      Notas de Voz
                    </Link>
                  </li>
                </ul>
              </nav>
            </header>
            {children}
          </DeepgramContextProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
