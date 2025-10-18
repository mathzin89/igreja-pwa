// src/app/layout.tsx (o layout ROOT do seu projeto)
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext'; // Seu AuthProvider

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AD Plenitude',
  description: 'Aplicativo PWA da AD Plenitude',
  // ✅ Adiciona meta tags do PWA
  manifest: '/manifest.json', // Caminho para o seu manifest.json
  themeColor: '#1976d2', // Cor principal do seu tema (cor da AppBar do Material-UI)
  viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover',
  // Você pode adicionar ícones aqui ou no manifest
  icons: {
    icon: '/icons/icon-192x192.png', // Ícone padrão
    apple: '/icons/apple-icon.png', // Ícone para iOS
  },
  // Mais meta tags para PWA (Apple-specific)
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AD Plenitude',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}