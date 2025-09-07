import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { MainLayout } from '@/components/MainLayout';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TimeCash King - Sistema de Gestão Financeira',
  description: 'Sistema completo de gestão financeira, estoque e vendas com interface moderna',
  keywords: 'gestão financeira, estoque, vendas, contabilidade, empresa',
  authors: [{ name: 'TimeCash King Team' }],
  creator: 'TimeCash King',
  publisher: 'TimeCash King',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.json',
  themeColor: '#FFD700',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TimeCash King',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://timecashking.com',
    title: 'TimeCash King - Sistema de Gestão Financeira',
    description: 'Sistema completo de gestão financeira, estoque e vendas',
    siteName: 'TimeCash King',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TimeCash King - Sistema de Gestão Financeira',
    description: 'Sistema completo de gestão financeira, estoque e vendas',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="application-name" content="TimeCash King" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TimeCash King" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#FFD700" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <MainLayout>
            {children}
          </MainLayout>
        </Providers>
      </body>
    </html>
  );
}
