import type { Metadata } from 'next';
import { LoginForm } from './login-form';

export const metadata: Metadata = {
  title: 'Login - NeonPro',
  description: 'Acesse sua conta NeonPro',
};

export default function LoginPage() {
  return (
    <div className="container relative hidden h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center font-medium text-lg">
          <svg
            className="mr-2 h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          NeonPro
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Sistema completo de gestão empresarial com foco em saúde e
              compliance.&rdquo;
            </p>
            <footer className="text-sm">Equipe NeonPro</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="font-semibold text-2xl tracking-tight">
              Acesse sua conta
            </h1>
            <p className="text-muted-foreground text-sm">
              Digite suas credenciais para continuar
            </p>
          </div>
          <LoginForm />
          <p className="px-8 text-center text-muted-foreground text-sm">
            Ao clicar em continuar, você concorda com nossos{' '}
            <a
              className="underline underline-offset-4 hover:text-primary"
              href="/terms"
            >
              Termos de Serviço
            </a>{' '}
            e{' '}
            <a
              className="underline underline-offset-4 hover:text-primary"
              href="/privacy"
            >
              Política de Privacidade
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
