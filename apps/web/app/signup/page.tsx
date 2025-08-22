import type { Metadata } from 'next';
import { SignupForm } from '@/components/auth/signup-form';

export const metadata: Metadata = {
  title: 'Cadastro - NeonPro Healthcare',
  description: 'Crie sua conta no NeonPro Healthcare - Sistema completo de gestão para clínicas estéticas',
  keywords: 'cadastro, registro, clínica estética, gestão, LGPD, ANVISA, CFM',
};

export default function SignupPage() {
  return (
    <div className="container relative hidden h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-gradient-to-br from-primary/5 to-chart-5/5 p-10 text-foreground lg:flex border-r border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-chart-5/5" />
        <div className="relative z-20 flex items-center font-medium text-xl">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg neonpro-gradient neonpro-glow mr-3">
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
          <span className="text-primary font-bold">NeonPro Healthcare</span>
        </div>
        <div className="relative z-20 mt-auto space-y-8">
          <blockquote className="space-y-4">
            <p className="text-lg text-foreground leading-relaxed font-medium">
              &ldquo;Transforme sua clínica estética com tecnologia brasileira de ponta. 
              Junte-se a centenas de profissionais que já confiam na nossa plataforma 
              para gestão completa, segura e em total conformidade.&rdquo;
            </p>
            <footer className="text-muted-foreground font-medium">
              Dra. Maria Fernanda, Diretora Médica - Instituto Estética Brasil
            </footer>
          </blockquote>
          
          {/* Enhanced Benefits */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground/90 uppercase tracking-wide">
              Por que escolher o NeonPro Healthcare?
            </h4>
            <div className="space-y-3">
              <div className="trust-indicator">
                <span className="text-foreground/80">Conformidade LGPD/ANVISA automatizada</span>
              </div>
              <div className="trust-indicator">
                <span className="text-foreground/80">Gestão especializada para medicina estética</span>
              </div>
              <div className="trust-indicator">
                <span className="text-foreground/80">Segurança de dados de nível hospitalar</span>
              </div>
              <div className="trust-indicator">
                <span className="text-foreground/80">Treinamento e suporte especializado incluído</span>
              </div>
              <div className="trust-indicator">
                <span className="text-foreground/80">Teste gratuito por 30 dias sem compromisso</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="font-semibold text-2xl tracking-tight">
              Crie sua conta
            </h1>
            <p className="text-muted-foreground text-sm">
              Complete os dados para começar a usar o NeonPro Healthcare
            </p>
          </div>
          <SignupForm />
          <p className="px-8 text-center text-muted-foreground text-sm">
            Ao criar sua conta, você concorda com nossos{' '}
            <a
              className="underline underline-offset-4 hover:text-primary"
              href="/terms"
              target="_blank"
            >
              Termos de Serviço
            </a>
            ,{' '}
            <a
              className="underline underline-offset-4 hover:text-primary"
              href="/privacy"
              target="_blank"
            >
              Política de Privacidade LGPD
            </a>
            {' '}e confirma estar ciente das{' '}
            <a
              className="underline underline-offset-4 hover:text-primary"
              href="/compliance"
              target="_blank"
            >
              Diretrizes de Conformidade ANVISA/CFM
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}