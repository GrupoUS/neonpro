import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { ptBR } from '@clerk/localizations'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NeonPro - Sistema de Gestão de Saúde',
  description: 'Sistema completo de gestão para profissionais de saúde com compliance LGPD',
  keywords: ['saúde', 'gestão', 'LGPD', 'prontuário eletrônico', 'agendamento'],
  authors: [{ name: 'NeonPro Team' }],
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      localization={ptBR}
      appearance={{
        baseTheme: undefined,
        variables: {
          // Healthcare-focused color scheme
          colorPrimary: '#0ea5e9', // Sky blue for healthcare
          colorBackground: '#ffffff',
          colorInputBackground: '#f8fafc',
          colorInputText: '#1e293b',
          borderRadius: '0.5rem',
        },
        elements: {
          // Custom styling for healthcare compliance
          formButtonPrimary: 
            'bg-sky-500 hover:bg-sky-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200',
          card: 
            'bg-white shadow-lg border border-slate-200 rounded-xl p-6',
          headerTitle: 
            'text-slate-900 font-semibold text-xl',
          headerSubtitle: 
            'text-slate-600 text-sm mt-1',
          socialButtonsBlockButton: 
            'border border-slate-300 hover:border-slate-400 text-slate-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200',
          formFieldInput: 
            'border border-slate-300 focus:border-sky-500 focus:ring-sky-500 rounded-lg px-3 py-2',
          footerActionText: 
            'text-slate-600 text-sm',
          footerActionLink: 
            'text-sky-600 hover:text-sky-700 font-medium text-sm',
        }
      }}
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <html lang="pt-BR">
        <head>
          {/* Healthcare compliance meta tags */}
          <meta name="robots" content="index, follow" />
          <meta name="googlebot" content="index, follow" />
          <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
          <meta httpEquiv="X-Frame-Options" content="DENY" />
          <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
          <meta name="referrer" content="strict-origin-when-cross-origin" />
          
          {/* LGPD and privacy compliance */}
          <meta name="privacy-policy" content="/privacy" />
          <meta name="terms-of-service" content="/terms" />
          <meta name="data-protection" content="LGPD compliant" />
          
          {/* Healthcare specific tags */}
          <meta name="healthcare-compliance" content="HIPAA, LGPD" />
          <meta name="data-classification" content="healthcare-sensitive" />
        </head>
        <body className={`${inter.className} bg-slate-50 text-slate-900`}>
          {/* Healthcare data protection notice */}
          <div className="sr-only" role="region" aria-label="Aviso de proteção de dados">
            Este sistema processa dados sensíveis de saúde em conformidade com a LGPD
          </div>
          
          {/* Main application wrapper */}
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50">
            {/* TODO: Add existing providers here (theme, etc.) */}
            {/* TODO: Add existing healthcare context providers */}
            {children}
          </div>
          
          {/* Healthcare compliance footer */}
          <div className="sr-only" role="contentinfo" aria-label="Informações de conformidade">
            Sistema em conformidade com LGPD (Lei Geral de Proteção de Dados)
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}