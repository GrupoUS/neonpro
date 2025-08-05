import type { Metadata } from "next";
import type { Inter } from "next/font/google";
import "./globals.css";
import type { ptBR } from "@clerk/localizations";
import type { ClerkProvider } from "@clerk/nextjs";
import type {
  clerkConfig,
  healthcareAppearance,
  validateClerkConfig,
} from "@/lib/auth/clerk-config";
import { TRPCProvider } from "@/utils/trpc-provider";

const inter = Inter({ subsets: ["latin"] });

// Validate Clerk configuration at build time
validateClerkConfig();

export const metadata: Metadata = {
  title: "NeonPro - Sistema de Gestão de Saúde",
  description: "Sistema completo de gestão para profissionais de saúde com compliance LGPD",
  keywords: ["saúde", "gestão", "LGPD", "prontuário eletrônico", "agendamento"],
  authors: [{ name: "NeonPro Team" }],
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      publishableKey={clerkConfig.publishableKey}
      localization={ptBR}
      appearance={healthcareAppearance}
      signInUrl={clerkConfig.signInUrl}
      signUpUrl={clerkConfig.signUpUrl}
      afterSignInUrl={clerkConfig.afterSignInUrl}
      afterSignUpUrl={clerkConfig.afterSignUpUrl}
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
          <TRPCProvider>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50">{children}</div>
          </TRPCProvider>

          {/* Healthcare compliance footer */}
          <div className="sr-only" role="contentinfo" aria-label="Informações de conformidade">
            Sistema em conformidade com LGPD (Lei Geral de Proteção de Dados)
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
