/**
 * Sign Up Page
 * Healthcare-focused registration with LGPD compliance
 */

import { SignUp } from '@/lib/auth';
import { clerkConfig } from '@/lib/auth/clerk-config';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Healthcare branding */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            NeonPro
          </h1>
          <p className="text-sm text-slate-600">
            Cadastro no Sistema de Gestão de Saúde
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Registro seguro em conformidade com a LGPD
          </p>
        </div>

        {/* LGPD Consent Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">
                Consentimento LGPD
              </h3>
              <div className="mt-2 text-sm text-amber-700">
                <p>
                  Ao se cadastrar, você está consentindo com o processamento 
                  dos seus dados conforme nossa{' '}
                  <a href="/privacy" className="underline hover:text-amber-600">
                    Política de Privacidade
                  </a>. 
                  Seus dados são tratados com máxima segurança.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Clerk Sign Up Component */}
        <div className="flex justify-center">
          <SignUp 
            path="/cadastro"
            routing="path"
            signInUrl="/entrar"
            redirectUrl={clerkConfig.afterSignUpUrl}
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

        {/* Data Protection Information */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-slate-900 mb-2">
            Proteção dos Seus Dados
          </h4>
          <ul className="text-xs text-slate-600 space-y-1">
            <li>• Criptografia de ponta a ponta para dados sensíveis</li>
            <li>• Conformidade com LGPD e regulamentações de saúde</li>
            <li>• Direito ao esquecimento e portabilidade de dados</li>
            <li>• Auditoria completa de acesso aos dados</li>
          </ul>
        </div>

        {/* Healthcare compliance footer */}
        <div className="text-center">
          <p className="text-xs text-slate-500 mb-2">
            Ambiente seguro para profissionais de saúde
          </p>
          <div className="flex justify-center space-x-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              LGPD
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Healthcare
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              ISO 27001
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}