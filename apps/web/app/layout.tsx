import type { Metadata, } from 'next'
import { Inter, JetBrains_Mono, } from 'next/font/google'
import './globals.css'

import { ClientInit, } from '@/components/ClientInit'
import { HealthcareErrorBoundary, } from '@/components/ErrorBoundary'
import { Toaster, } from '@/components/ui/toaster'
import { RealAuthProvider, } from '@/contexts/RealAuthContext'
import { initializeServer, } from '@/lib/init'
import { QueryProvider, } from '@/providers/query-provider'

const inter = Inter({
  subsets: ['latin',],
  display: 'swap',
  variable: '--font-inter',
},)

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin',],
  display: 'swap',
  variable: '--font-jetbrains-mono',
},)

export const metadata: Metadata = {
  title: 'NeonPro - Healthcare Management',
  description: 'Professional healthcare management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
},) {
  // Initialize server-side environment validation on app startup
  initializeServer()

  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans`}>
        <HealthcareErrorBoundary showDetails={false}>
          <ClientInit>
            <QueryProvider>
              <RealAuthProvider>
                {children}
                <Toaster />

                {/* AI Agent Chat Placeholder - será implementado como componente separado */}
                <div className="fixed bottom-5 right-5 z-50">
                  <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center animate-pulse shadow-lg cursor-pointer hover:scale-110 transition-transform">
                    <span className="text-primary-foreground text-xs">🤖</span>
                  </div>
                </div>
              </RealAuthProvider>
            </QueryProvider>
          </ClientInit>
        </HealthcareErrorBoundary>
      </body>
    </html>
  )
}
