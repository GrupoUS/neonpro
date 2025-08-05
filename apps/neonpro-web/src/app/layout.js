"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = RootLayout;
var google_1 = require("next/font/google");
require("./globals.css");
var nextjs_1 = require("@clerk/nextjs");
var localizations_1 = require("@clerk/localizations");
var clerk_config_1 = require("@/lib/auth/clerk-config");
var inter = (0, google_1.Inter)({ subsets: ["latin"] });
// Validate Clerk configuration at build time
(0, clerk_config_1.validateClerkConfig)();
exports.metadata = {
  title: "NeonPro - Sistema de Gestão de Saúde",
  description: "Sistema completo de gestão para profissionais de saúde com compliance LGPD",
  keywords: ["saúde", "gestão", "LGPD", "prontuário eletrônico", "agendamento"],
  authors: [{ name: "NeonPro Team" }],
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1",
};
function RootLayout(_a) {
  var children = _a.children;
  return (
    <nextjs_1.ClerkProvider
      publishableKey={clerk_config_1.clerkConfig.publishableKey}
      localization={localizations_1.ptBR}
      appearance={clerk_config_1.healthcareAppearance}
      signInUrl={clerk_config_1.clerkConfig.signInUrl}
      signUpUrl={clerk_config_1.clerkConfig.signUpUrl}
      afterSignInUrl={clerk_config_1.clerkConfig.afterSignInUrl}
      afterSignUpUrl={clerk_config_1.clerkConfig.afterSignUpUrl}
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
        <body className={"".concat(inter.className, " bg-slate-50 text-slate-900")}>
          {/* Healthcare data protection notice */}
          <div className="sr-only" role="region" aria-label="Aviso de proteção de dados">
            Este sistema processa dados sensíveis de saúde em conformidade com a LGPD
          </div>

          {/* Main application wrapper */}
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50">{children}</div>

          {/* Healthcare compliance footer */}
          <div className="sr-only" role="contentinfo" aria-label="Informações de conformidade">
            Sistema em conformidade com LGPD (Lei Geral de Proteção de Dados)
          </div>
        </body>
      </html>
    </nextjs_1.ClerkProvider>
  );
}
