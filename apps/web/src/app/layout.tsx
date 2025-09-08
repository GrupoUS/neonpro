import type { Metadata, } from 'next'
import { Inter, JetBrains_Mono, Lora, } from 'next/font/google'
import './globals.css'

import { PerformanceStatus, } from '@/components/performance/performance-status'
import { Toaster, } from '@/components/ui/toaster'
import { ApiProvider, } from '@/contexts/api-context'
import { AuthProvider, } from '@/contexts/auth-context'
import { HealthcareThemeProvider, } from '@/contexts/theme-context'
import { PerformanceMonitorProvider, } from '@/providers/performance-monitor-provider'

// Enhanced font loading for Portuguese medical content
const inter = Inter({
  subsets: ['latin',],
  display: 'swap',
  variable: '--font-inter',
},)

const lora = Lora({
  subsets: ['latin',],
  display: 'swap',
  variable: '--font-lora',
},)

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin',],
  display: 'swap',
  variable: '--font-jetbrains-mono',
},)

export const metadata: Metadata = {
  title: 'NeonPro - Plataforma Healthcare AI',
  description:
    'Plataforma de gestão para clínicas de estética com IA integrada e compliance LGPD/ANVISA/CFM',
  keywords: [
    'healthcare',
    'estética',
    'LGPD',
    'ANVISA',
    'CFM',
    'gestão clínica',
    'inteligência artificial',
    'agendamento',
    'pacientes',
    'prontuário eletrônico',
    'compliance médico',
  ],
  authors: [{ name: 'NeonPro Healthcare Team', },],
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
  robots: 'index, follow',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#72e3ad', },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a', },
  ],
  openGraph: {
    title: 'NeonPro - Healthcare AI Platform',
    description: 'Gestão inteligente para clínicas de estética brasileiras',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'NeonPro Healthcare',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NeonPro - Healthcare AI Platform',
    description: 'Gestão inteligente para clínicas de estética brasileiras',
  },
  // Healthcare-specific metadata
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'format-detection': 'telephone=no',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
},) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${inter.variable} ${lora.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />

        {/* Enhanced PWA Support for Healthcare Mobile Apps */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="NeonPro Healthcare" />

        {/* Emergency Contact Detection - Disabled for healthcare forms */}
        <meta name="format-detection" content="telephone=no" />

        {/* Accessibility Enhancement */}
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className="font-sans antialiased">
        <HealthcareThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          <AuthProvider>
            <ApiProvider>
              <PerformanceMonitorProvider
                clinicId="neonpro-default"
                enableRealtimeStreaming
                config={{
                  webVitalsEnabled: true,
                  aiMetricsEnabled: false, // Conservative start - will enable in T1.5.2
                  cacheMetricsEnabled: true,
                  systemMetricsEnabled: false, // Browser limitation
                  auditTrailEnabled: true,
                  collectInterval: 5000, // 5s for healthcare responsiveness
                }}
              >
                <div className="min-h-screen bg-background text-foreground">
                  <div className="relative flex min-h-screen flex-col">
                    <main className="flex-1">{children}</main>
                  </div>

                  {/* Healthcare Toast System */}
                  <Toaster />

                  {/* Emergency Mode Indicator */}
                  <div
                    id="emergency-mode-indicator"
                    className="emergency-mode-indicator"
                    aria-live="polite"
                    aria-atomic="true"
                  />

                  {/* Accessibility Announcements */}
                  <div
                    id="accessibility-announcements"
                    className="sr-only"
                    aria-live="assertive"
                    aria-atomic="true"
                  />

                  {/* Performance Monitoring Status (Development Only) */}
                  <PerformanceStatus />
                </div>
              </PerformanceMonitorProvider>
            </ApiProvider>
          </AuthProvider>
        </HealthcareThemeProvider>

        {/* Emergency Mode Global Styles Injection */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Emergency Mode Quick Activation (Ctrl+Shift+E)
              document.addEventListener('keydown', function(e) {
                if (e.ctrlKey && e.shiftKey && e.key === 'E') {
                  e.preventDefault();
                  document.documentElement.classList.toggle('emergency-mode');
                  
                  // Announce to screen readers
                  const announcement = document.getElementById('accessibility-announcements');
                  if (announcement) {
                    announcement.textContent = document.documentElement.classList.contains('emergency-mode') 
                      ? 'Modo de emergência ativado - Interface otimizada para situações críticas'
                      : 'Modo de emergência desativado';
                  }
                }
              });
              
              // High contrast detection
              if (window.matchMedia('(prefers-contrast: high)').matches) {
                document.documentElement.classList.add('high-contrast');
              }
              
              // Reduced motion detection
              if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                document.documentElement.style.setProperty('--motion-scale', '0');
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
