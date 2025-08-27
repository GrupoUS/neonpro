import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Login - NeonPro",
  description: "Acesse sua conta NeonPro",
};

export default function LoginPage() {
  return (
    <div className="container relative hidden h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col border-border border-r bg-gradient-to-br from-primary/5 to-chart-5/5 p-10 text-foreground lg:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-chart-5/5" />
        <div className="relative z-20 flex items-center font-medium text-xl">
          <div className="neonpro-gradient neonpro-glow mr-3 flex h-8 w-8 items-center justify-center rounded-lg">
            <svg
              className="h-5 w-5 text-primary-foreground"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <span className="font-bold text-primary">NeonPro Healthcare</span>
        </div>

        {/* Enhanced Healthcare Branding */}
        <div className="relative z-20 mt-auto space-y-8">
          <blockquote className="space-y-4">
            <p className="font-medium text-foreground text-lg leading-relaxed">
              &ldquo;Tecnologia de ponta para clínicas estéticas brasileiras. Gestão completa,
              segura e em total conformidade com LGPD, ANVISA e CFM.&rdquo;
            </p>
            <footer className="font-medium text-muted-foreground">
              Dr. Ana Carolina Silva, Clínica Estética Premium - São Paulo
            </footer>
          </blockquote>

          {/* Trust Indicators */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground/90 text-sm uppercase tracking-wide">
              Certificações e Compliance
            </h4>
            <div className="space-y-3">
              <div className="trust-indicator">
                <span className="text-foreground/80">
                  Conformidade LGPD completa
                </span>
              </div>
              <div className="trust-indicator">
                <span className="text-foreground/80">
                  Aprovação ANVISA para dados de saúde
                </span>
              </div>
              <div className="trust-indicator">
                <span className="text-foreground/80">
                  Certificação ISO 27001 de segurança
                </span>
              </div>
              <div className="trust-indicator">
                <span className="text-foreground/80">
                  Suporte especializado 24/7
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-background lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[400px]">
          {/* Enhanced Header */}
          <div className="flex flex-col space-y-3 text-center">
            <div className="neonpro-gradient neonpro-glow mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
              <svg
                className="h-6 w-6 text-primary-foreground"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <h1 className="font-bold text-3xl text-foreground tracking-tight">
              Bem-vindo de Volta
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Acesse sua conta NeonPro Healthcare para gerenciar sua clínica com segurança e
              eficiência
            </p>
          </div>

          {/* Login Form */}
          <LoginForm />

          {/* Enhanced Legal Notice */}
          <div className="space-y-4">
            <p className="px-4 text-center text-muted-foreground text-xs leading-relaxed">
              Ao continuar, você concorda com nossos{" "}
              <a
                className="font-medium underline underline-offset-4 hover:text-primary"
                href="/terms"
              >
                Termos de Serviço
              </a>
              ,{" "}
              <a
                className="font-medium underline underline-offset-4 hover:text-primary"
                href="/privacy"
              >
                Política de Privacidade LGPD
              </a>{" "}
              e{" "}
              <a
                className="font-medium underline underline-offset-4 hover:text-primary"
                href="/compliance"
              >
                Diretrizes de Conformidade
              </a>
              .
            </p>

            {/* Security Notice */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
              <p className="text-foreground/80 text-xs">
                🔒 Conexão segura com criptografia de nível bancário • Dados protegidos conforme
                LGPD • Auditoria contínua de segurança
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
