import type { Metadata } from "next";
import "./globals.css";
// Adicionando providers necessários para autenticação e tema
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import SubscriptionWrapper from "@/components/subscription/subscription-wrapper";
import { ThemeProvider } from "@/components/theme-provider";
import { CriticalErrorBoundary } from "@/components/ui/error-boundary";
import { AuthProvider } from "@/contexts/auth-context";
import { PerformanceMonitor } from "@/lib/performance/integration";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "NEON PRO - Sistema de Gestão",
  description: "Sistema completo para gestão de clínicas e consultórios",
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
        <CriticalErrorBoundary>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AuthProvider>
              <PerformanceMonitor>
                <SubscriptionWrapper>{children}</SubscriptionWrapper>
              </PerformanceMonitor>
            </AuthProvider>
          </ThemeProvider>
        </CriticalErrorBoundary>

        {/* Notifications Toast Container */}
        <Toaster position="top-right" richColors closeButton />

        {/* Service Worker Registration for PWA */}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
