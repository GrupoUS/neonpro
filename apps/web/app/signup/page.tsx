// app/signup/page.tsx
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-sky-50 p-4">
      <div className="w-full max-w-md">
        {/* Healthcare compliance notice */}
        <div className="mb-6 text-center">
          <h1 className="mb-2 font-bold text-2xl text-slate-900">
            NeonPro - Cadastro Seguro
          </h1>
          <p className="text-slate-600 text-sm">
            Crie sua conta em conformidade com LGPD para profissionais de saúde
          </p>
        </div>

        {/* Clerk SignUp Component with Healthcare Styling */}
        <SignUp
          appearance={{
            variables: {
              colorPrimary: '#0ea5e9', // Sky blue for healthcare
              colorBackground: '#ffffff',
              colorInputBackground: '#f8fafc',
              colorInputText: '#1e293b',
              borderRadius: '0.5rem',
            },
            elements: {
              formButtonPrimary:
                'bg-sky-500 hover:bg-sky-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200',
              card: 'bg-white shadow-xl border border-slate-200 rounded-xl p-6',
              headerTitle: 'text-slate-900 font-semibold text-xl',
              headerSubtitle: 'text-slate-600 text-sm mt-1',
              socialButtonsBlockButton:
                'border border-slate-300 hover:border-slate-400 text-slate-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200',
              formFieldInput:
                'border border-slate-300 focus:border-sky-500 focus:ring-sky-500 rounded-lg px-3 py-2',
              footerActionText: 'text-slate-600 text-sm',
              footerActionLink:
                'text-sky-600 hover:text-sky-700 font-medium text-sm',
            },
          }}
          path="/signup"
          redirectUrl="/dashboard"
          routing="path"
        />

        {/* Healthcare compliance footer */}
        <div className="mt-6 text-center text-slate-500 text-xs">
          <p>
            Dados protegidos conforme LGPD • Cadastro seguro para profissionais
            de saúde
          </p>
          <p className="mt-1">
            Ao criar sua conta, você concorda com nossos{' '}
            <a className="text-sky-600 hover:underline" href="/terms">
              Termos de Uso
            </a>{' '}
            e{' '}
            <a className="text-sky-600 hover:underline" href="/privacy">
              Política de Privacidade
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Cadastro - NeonPro',
  description:
    'Cadastro seguro para profissionais de saúde - Sistema em conformidade com LGPD',
  robots: 'index, follow',
};
