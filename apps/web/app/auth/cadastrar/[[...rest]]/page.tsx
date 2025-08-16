import { SignUp } from '@clerk/nextjs';

export default function CadastrarPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 to-slate-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Healthcare branding header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500">
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>
          <h2 className="mt-6 font-bold text-3xl text-slate-900">
            Criar Conta - NeonPro
          </h2>
          <p className="mt-2 text-slate-600 text-sm">
            Junte-se à plataforma de gestão de saúde mais segura
          </p>
          <div className="mt-4 rounded-lg bg-slate-100 px-3 py-2 text-slate-500 text-xs">
            🔒 Dados protegidos pela LGPD
          </div>
        </div>

        {/* Clerk SignUp Component */}
        <div className="mt-8">
          <SignUp
            appearance={{
              elements: {
                rootBox: 'mx-auto',
                card: 'shadow-xl border-0 bg-white/80 backdrop-blur-sm',
                headerTitle: 'text-slate-900 font-semibold',
                headerSubtitle: 'text-slate-600',
                socialButtonsBlockButton:
                  'border-slate-200 hover:border-slate-300 text-slate-700',
                formFieldInput:
                  'border-slate-200 focus:border-sky-500 focus:ring-sky-500',
                formButtonPrimary:
                  'bg-sky-500 hover:bg-sky-600 text-white font-medium',
                footerActionLink: 'text-sky-600 hover:text-sky-700',
                formFieldSuccessText: 'text-emerald-600',
                formFieldErrorText: 'text-red-600',
                identityPreviewText: 'text-slate-700',
                identityPreviewEditButton: 'text-sky-600 hover:text-sky-700',
              },
              variables: {
                colorPrimary: '#0ea5e9',
                colorBackground: 'rgba(255, 255, 255, 0.8)',
                colorInputBackground: '#f8fafc',
                borderRadius: '0.75rem',
                colorSuccess: '#10b981',
                colorDanger: '#ef4444',
              },
            }}
            path="/auth/cadastrar"
            redirectUrl="/dashboard"
            routing="path"
            signInUrl="/auth/entrar"
          />
        </div>

        {/* Healthcare compliance and LGPD notice */}
        <div className="space-y-3 text-center text-slate-500 text-xs">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800">
            <p className="font-medium">
              ⚠️ Importante - Profissionais de Saúde
            </p>
            <p className="mt-1">
              Este sistema é destinado exclusivamente a profissionais de saúde
              licenciados. Ao criar sua conta, você confirma possuir registro
              profissional válido.
            </p>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-blue-800">
            <p className="font-medium">🔒 Proteção de Dados LGPD</p>
            <p className="mt-1">
              Seus dados pessoais e de saúde são tratados com máxima segurança,
              em conformidade com a Lei Geral de Proteção de Dados (LGPD).
            </p>
          </div>

          <div className="flex justify-center space-x-4 pt-2">
            <a className="text-sky-600 hover:text-sky-700" href="/privacy">
              Política de Privacidade
            </a>
            <span className="text-slate-300">•</span>
            <a className="text-sky-600 hover:text-sky-700" href="/terms">
              Termos de Uso
            </a>
            <span className="text-slate-300">•</span>
            <a className="text-sky-600 hover:text-sky-700" href="/lgpd">
              Direitos LGPD
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// SEO and accessibility metadata
export const metadata = {
  title: 'Criar Conta - NeonPro Saúde',
  description:
    'Registre-se na plataforma de gestão de saúde mais segura do Brasil com conformidade LGPD',
  robots: 'noindex, nofollow', // Prevent indexing of auth pages
};
