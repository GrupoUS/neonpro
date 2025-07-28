import type { Metadata, Viewport } from 'next'
import { Inter, Lora, Libre_Baskerville } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

// NEONPROV1 Theme Fonts Configuration
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const lora = Lora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lora',
})

const libreBaskerville = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-libre-baskerville',
})

// Healthcare-specific metadata with LGPD compliance
export const metadata: Metadata = {
  title: {
    template: '%s | NeonPro - Sistema de Saúde Digital',
    default: 'NeonPro - Sistema de Saúde Digital Brasileiro',
  },
  description: 'Plataforma digital de saúde brasileira em conformidade com LGPD, ANVISA e CFM. Tecnologia avançada para profissionais de saúde e pacientes.',
  keywords: [
    'saúde digital',
    'LGPD compliant',
    'ANVISA',
    'CFM',
    'telemedicina',
    'prontuário eletrônico',
    'sistema hospitalar',
    'healthcare Brasil'
  ],
  authors: [{ name: 'NeonPro Team' }],
  creator: 'NeonPro Healthcare Solutions',
  publisher: 'NeonPro Brasil',
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
  
  // Open Graph for healthcare system
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://neonpro.health',
    title: 'NeonPro - Sistema de Saúde Digital Brasileiro',
    description: 'Plataforma digital de saúde em conformidade com LGPD, ANVISA e CFM',
    siteName: 'NeonPro Health',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'NeonPro - Sistema de Saúde Digital',
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'NeonPro - Sistema de Saúde Digital',
    description: 'Healthcare digital brasileiro com compliance LGPD',
    images: ['/og-image.jpg'],
  },
  
  // Healthcare and compliance specific metadata
  other: {
    'healthcare-compliance': 'LGPD,ANVISA,CFM',
    'data-protection': 'LGPD-2020-compliant',
    'medical-device-class': 'Software-as-Medical-Device',
    'regulatory-approval': 'ANVISA-pending',
    'cfm-resolution': '2.314/2022-compliant',
    'privacy-policy': '/privacy-policy',
    'terms-service': '/terms-of-service',
    'hipaa-equivalent': 'LGPD-Article-11-compliant',
  },
  
  // App-specific metadata
  applicationName: 'NeonPro Health',
  referrer: 'origin-when-cross-origin',
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0ea5e9' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  
  // Verification and analytics
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  
  // App icons and manifest
  icons: {
    icon: [
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'icon',
        type: 'image/svg+xml',
        url: '/icon.svg',
      },
    ],
  },
  manifest: '/manifest.json',
}

// Viewport configuration for healthcare mobile-first design
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 1,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0ea5e9' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  colorScheme: 'light dark',
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html 
      lang="pt-BR" 
      className={`${inter.variable} ${lora.variable} ${libreBaskerville.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Healthcare-specific security headers */}
        <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        <meta httpEquiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=()" />
        
        {/* Healthcare accessibility metadata */}
        <meta name="accessibility-standard" content="WCAG-2.1-AA" />
        <meta name="healthcare-accessibility" content="ADA-compliant" />
        
        {/* Brazilian healthcare compliance */}
        <meta name="lgpd-compliance" content="true" />
        <meta name="anvisa-compliance" content="software-medical-device" />
        <meta name="cfm-compliance" content="resolution-2314-2022" />
        <meta name="data-classification" content="personal-health-information" />
        
        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Preconnect for critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body 
        className={`
          font-inter antialiased
          bg-white dark:bg-slate-950
          text-slate-900 dark:text-slate-50
          selection:bg-sky-100 dark:selection:bg-sky-900
          min-h-screen
          overflow-x-hidden
          ${process.env.NODE_ENV === 'development' ? 'debug-screens' : ''}
        `}
      >
        {/* Accessibility skip link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-sky-600 text-white px-4 py-2 rounded-md font-medium hover:bg-sky-700 transition-colors"
          aria-label="Pular para o conteúdo principal"
        >
          Pular para o conteúdo principal
        </a>
        
        {/* LGPD Compliance Notice - Hidden by default, shown via client-side script */}
        <div
          id="lgpd-notice"
          className="hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white p-4 text-sm"
          role="banner"
          aria-labelledby="lgpd-title"
        >
          <div className="container mx-auto max-w-4xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h2 id="lgpd-title" className="font-semibold mb-1">
                Proteção de Dados Pessoais - LGPD
              </h2>
              <p className="text-slate-200 leading-relaxed">
                Este sistema processa dados pessoais de saúde em conformidade com a LGPD (Lei 13.709/2018), 
                ANVISA e Resolução CFM 2.314/2022. Seus dados são protegidos e utilizados exclusivamente 
                para finalidades médicas autorizadas.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              <button
                id="lgpd-accept"
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                aria-label="Aceitar política de privacidade"
              >
                Aceitar
              </button>
              <a
                href="/privacy-policy"
                className="px-4 py-2 border border-slate-600 hover:border-slate-500 text-slate-200 hover:text-white rounded-md font-medium transition-colors text-center focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                aria-label="Ler política de privacidade completa"
              >
                Saiba Mais
              </a>
            </div>
          </div>
        </div>

        {/* Main application content */}
        <div id="main-content" tabIndex={-1}>
          {children}
        </div>

        {/* Toast notifications system */}
        <Toaster
          position="top-right"
          expand={true}
          visibleToasts={5}
          closeButton={true}
          richColors={true}
          duration={5000}
          toastOptions={{
            className: 'neonpro-toast',
            descriptionClassName: 'neonpro-toast-description',
            actionButtonClassName: 'neonpro-toast-action',
            cancelButtonClassName: 'neonpro-toast-cancel',
            closeButtonAriaLabel: 'Fechar notificação',
            style: {
              fontFamily: 'var(--font-inter)',
            },
          }}
          containerAriaLabel="Notificações do sistema"
          dir="ltr"
          theme="system"
        />

        {/* Healthcare emergency contact - Always visible for compliance */}
        <div 
          className="fixed bottom-4 right-4 z-40"
          role="complementary"
          aria-label="Contato de emergência médica"
        >
          <a
            href="tel:192"
            className="hidden sm:flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full shadow-lg font-medium transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label="Ligar para SAMU - Emergência médica 192"
          >
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" 
              />
            </svg>
            <span className="text-sm">SAMU 192</span>
          </a>
          <a
            href="tel:192"
            className="flex sm:hidden items-center justify-center w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label="Ligar para SAMU - Emergência médica 192"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" 
              />
            </svg>
          </a>
        </div>

        {/* Client-side LGPD compliance script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Check if LGPD consent was already given
                  const lgpdConsent = localStorage.getItem('neonpro-lgpd-consent');
                  const lgpdNotice = document.getElementById('lgpd-notice');
                  const lgpdAccept = document.getElementById('lgpd-accept');
                  
                  if (!lgpdConsent && lgpdNotice) {
                    // Show LGPD notice after a small delay
                    setTimeout(() => {
                      lgpdNotice.classList.remove('hidden');
                      lgpdNotice.setAttribute('aria-hidden', 'false');
                    }, 1000);
                  }
                  
                  if (lgpdAccept) {
                    lgpdAccept.addEventListener('click', function() {
                      localStorage.setItem('neonpro-lgpd-consent', 'accepted');
                      localStorage.setItem('neonpro-lgpd-date', new Date().toISOString());
                      if (lgpdNotice) {
                        lgpdNotice.classList.add('hidden');
                        lgpdNotice.setAttribute('aria-hidden', 'true');
                      }
                    });
                  }
                } catch (error) {
                  console.warn('LGPD compliance script error:', error);
                }
              })();
            `,
          }}
        />
      </body>
    </html>
  )
}