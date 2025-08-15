import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'sonner';
// Adicionando providers necessários para autenticação e tema
import { ServiceWorkerRegistration } from '@/components/service-worker-registration';
import { ThemeProvider } from '@/components/theme-provider';
import { CriticalErrorBoundary } from '@/components/ui/error-boundary';
import { AuthProvider } from '@/contexts/auth-context';

export const metadata: Metadata = {
  title: 'NEON PRO - Sistema de Gestão',
  description: 'Sistema completo para gestão de clínicas e consultórios',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        {/* Configurando providers de tema e autenticação */}
        <CriticalErrorBoundary title="Aplicação Principal">
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AuthProvider>{children}</AuthProvider>
          </ThemeProvider>
        </CriticalErrorBoundary>

        {/* Notifications Toast Container */}
        <Toaster closeButton position="top-right" richColors />

        {/* Service Worker Registration for PWA */}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
