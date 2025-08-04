/**
 * Sign In Page
 * Healthcare-focused authentication with LGPD compliance
 */

import { SignIn } from '@/lib/auth';
import { clerkConfig } from '@/lib/auth/clerk-config';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Healthcare branding */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            NeonPro
          </h1>
          <p className="text-sm text-slate-600">
            Sistema de Gestão de Saúde
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Acesso seguro em conformidade com a LGPD
          </p>
        </div>

        {/* LGPD Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Proteção de Dados
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Seus dados são protegidos conforme a LGPD. 
                  Ao fazer login, você concorda com nossa{' '}
                  <a href="/privacy" className="underline hover:text-blue-600">
                    Política de Privacidade
                  </a>{' '}
                  e{' '}
                  <a href="/terms" className="underline hover:text-blue-600">
                    Termos de Uso
                  </a>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Clerk Sign In Component */}
        <div className="flex justify-center">
          <SignIn 
            path="/entrar"
            routing="path"
            signUpUrl="/cadastro"
            redirectUrl={clerkConfig.afterSignInUrl}
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-xl border-0 bg-white/90 backdrop-blur-sm",
                headerTitle: "text-slate-900 text-xl font-semibold",
                headerSubtitle: "text-slate-600 text-sm",
                socialButtonsBlockButton: "border border-slate-300 hover:border-slate-400 text-slate-700 bg-white",
                formFieldInput: "border border-slate-300 focus:border-sky-500 focus:ring-sky-500",
                formButtonPrimary: "bg-sky-500 hover:bg-sky-600 text-white",
                footerActionLink: "text-sky-600 hover:text-sky-700"
              }
            }}
          />
        </div>

        {/* Healthcare compliance footer */}
        <div className="text-center">
          <p className="text-xs text-slate-500">
            Sistema certificado para dados sensíveis de saúde
          </p>
          <div className="flex justify-center space-x-4 mt-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              LGPD Compliant
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Healthcare Ready
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}