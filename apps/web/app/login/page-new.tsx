import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm, LoginFormSkeleton } from "./login-form-new";

export const metadata: Metadata = {
  title: "Login - NeonPro Healthcare",
  description: "Acesso seguro ao sistema de gestão médica - Conformidade LGPD",
  keywords: ["login", "sistema médico", "gestão clínica", "LGPD", "segurança"],
  robots: "noindex, nofollow", // Don't index login pages
  viewport: "width=device-width, initial-scale=1",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Main Container */}
      <div className="container relative hidden h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        
        {/* Left Side - Branding & Healthcare Information */}
        <div className="relative hidden h-full flex-col border-border border-r bg-gradient-to-br from-primary/5 to-chart-5/5 p-10 text-foreground lg:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-chart-5/5" />
          
          {/* Header */}
          <div className="relative z-20 flex items-center font-medium text-xl">
            <div className="neonpro-gradient neonpro-glow mr-3 flex h-10 w-10 items-center justify-center rounded-lg">
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
            <span className="font-bold text-primary">NeonPro Healthcare</span>
          </div>

          {/* Content */}
          <div className="relative z-20 mt-auto space-y-8">
            {/* Main Testimonial */}
            <blockquote className="space-y-4">
              <p className="font-medium text-foreground text-lg leading-relaxed">
                &ldquo;Plataforma completa que revolucionou nossa gestão. 
                Segurança total dos dados dos pacientes com conformidade 
                integral às regulamentações brasileiras.&rdquo;
              </p>
              <footer className="font-medium text-muted-foreground">
                Dr. Ana Carolina Silva<br />
                <span className="text-sm">Clínica Estética Premium - São Paulo</span>
              </footer>
            </blockquote>

            {/* Trust & Compliance Indicators */}
            <div className="space-y-6">
              {/* Certifications */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground/90 text-sm uppercase tracking-wide">
                  Certificações & Compliance
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 rounded-lg bg-background/20 p-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium">LGPD</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-background/20 p-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium">ANVISA</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-background/20 p-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium">CFM</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-background/20 p-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium">ISO 27001</span>
                  </div>
                </div>
              </div>

              {/* Key Features */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground/90 text-sm uppercase tracking-wide">
                  Recursos Principais
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-primary"></div>
                    Gestão completa de pacientes e agendamentos
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-primary"></div>
                    Prontuários eletrônicos seguros
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-primary"></div>
                    Relatórios e analytics avançados
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-primary"></div>
                    Integração com equipamentos médicos
                  </li>
                </ul>
              </div>

              {/* Security Stats */}
              <div className="rounded-lg bg-background/10 p-4 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">99.9%</div>
                  <div className="text-xs text-muted-foreground">Uptime Garantido</div>
                </div>
                <div className="mt-2 text-xs text-center text-muted-foreground">
                  Dados protegidos com criptografia AES-256<br />
                  Backup automático e redundância
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="lg:p-8 mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
          <Suspense fallback={<LoginFormSkeleton />}>
            <LoginForm />
          </Suspense>

          {/* Additional Security Notice */}
          <div className="px-8 text-center text-xs text-muted-foreground">
            <p>
              Ao acessar o sistema, você concorda com nossos{" "}
              <a href="/terms" className="underline hover:text-foreground">
                Termos de Uso
              </a>{" "}
              e{" "}
              <a href="/privacy" className="underline hover:text-foreground">
                Política de Privacidade
              </a>
            </p>
            <p className="mt-2">
              Sistema auditado e certificado para uso médico
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex min-h-screen flex-col items-center justify-center p-4 md:hidden">
        <div className="mb-8 text-center">
          <div className="neonpro-gradient neonpro-glow mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl">
            <svg
              className="h-8 w-8 text-primary-foreground"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-primary">NeonPro Healthcare</h1>
          <p className="text-muted-foreground">Sistema de Gestão Médica</p>
        </div>

        <Suspense fallback={<LoginFormSkeleton />}>
          <LoginForm />
        </Suspense>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>Conformidade LGPD • Segurança SSL • Dados Criptografados</p>
        </div>
      </div>
    </div>
  );
}