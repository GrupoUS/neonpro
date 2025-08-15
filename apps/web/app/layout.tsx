import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ptBR } from '@clerk/localizations';
import { ClerkProvider } from '@clerk/nextjs';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NeonPro - Sistema de Gestão de Saúde',
  description:
    'Sistema completo de gestão para profissionais de saúde com compliance LGPD',
  keywords: ['saúde', 'gestão', 'LGPD', 'prontuário eletrônico', 'agendamento'],
  authors: [{ name: 'NeonPro Team' }],
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
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
          card: 'bg-white shadow-lg border border-slate-200 rounded-xl p-6',
          headerTitle: 'text-slate-900 font-semibold text-xl',
          headerSubtitle: 'text-slate-600 text-sm mt-1',
          socialButtonsBlockButton:
            'border border-slate-300 hover:border-slate-400 text-slate-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200',
          formFieldInput:
            'border border-slate-300 focus:border-sky-500 focus:ring-sky-500 rounded-lg px-3 py-2',
          footerActionText: 'text-slate-600 text-sm',
          footerActionLink:
            'text-sky-600 hover:text-sky-700 font-medium text-sm',
        },
      }}
      localization={ptBR}
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <html lang="pt-BR">
        <head>
          {/* Healthcare compliance meta tags */}
          <meta content="index, follow" name="robots" />
          <meta content="index, follow" name="googlebot" />
          <meta content="nosniff" httpEquiv="X-Content-Type-Options" />
          <meta content="DENY" httpEquiv="X-Frame-Options" />
          <meta content="1; mode=block" httpEquiv="X-XSS-Protection" />
          <meta content="strict-origin-when-cross-origin" name="referrer" />

          {/* LGPD and privacy compliance */}
          <meta content="/privacy" name="privacy-policy" />
          <meta content="/terms" name="terms-of-service" />
          <meta content="LGPD compliant" name="data-protection" />

          {/* Healthcare specific tags */}
          <meta content="HIPAA, LGPD" name="healthcare-compliance" />
          <meta content="healthcare-sensitive" name="data-classification" />
        </head>
        <body className={`${inter.className} bg-slate-50 text-slate-900`}>
          {/* Healthcare data protection notice */}
          <div
            aria-label="Aviso de proteção de dados"
            className="sr-only"
            role="region"
          >
            Este sistema processa dados sensíveis de saúde em conformidade com a
            LGPD
          </div>

          {/* Main application wrapper */}
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50">
            {/* TODO: Add existing providers here (theme, etc.) */}
            {/* TODO: Add existing healthcare context providers */}
            {children}
          </div>

          {/* Healthcare compliance footer */}
          <div
            aria-label="Informações de conformidade"
            className="sr-only"
            role="contentinfo"
          >
            Sistema em conformidade com LGPD (Lei Geral de Proteção de Dados)
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
