import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@neonpro/ui';
import { ThemeProvider } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'NeonPro - Gestão para Clínicas de Estética',
    template: '%s | NeonPro',
  },
  description:
    'Sistema completo de gestão para clínicas de estética e beleza. Agendamentos, prontuários, compliance LGPD/ANVISA/CFM.',
  keywords: [
    'gestão clínica',
    'estética',
    'agendamentos',
    'prontuário eletrônico',
    'LGPD',
    'ANVISA',
    'CFM',
    'clínica de beleza',
  ],
  authors: [{ name: 'NeonPro Team' }],
  creator: 'NeonPro',
  publisher: 'NeonPro',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://neonpro.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://neonpro.app',
    title: 'NeonPro - Gestão para Clínicas de Estética',
    description:
      'Sistema completo de gestão para clínicas de estética e beleza.',
    siteName: 'NeonPro',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NeonPro - Gestão para Clínicas de Estética',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NeonPro - Gestão para Clínicas de Estética',
    description:
      'Sistema completo de gestão para clínicas de estética e beleza.',
    images: ['/og-image.png'],
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
  verification: {
    google: 'google-site-verification-code',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  colorScheme: 'light dark',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.className,
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
