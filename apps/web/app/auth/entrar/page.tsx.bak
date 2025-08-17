import { SignIn } from '@clerk/nextjs'

export default function EntrarPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Healthcare branding header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-sky-500 rounded-xl flex items-center justify-center">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-slate-900">
            NeonPro Saúde
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Acesso seguro ao seu sistema de gestão de saúde
          </p>
          <div className="mt-4 text-xs text-slate-500 bg-slate-100 rounded-lg px-3 py-2">
            🔒 Sistema em conformidade com LGPD
          </div>
        </div>

        {/* Clerk SignIn Component */}
        <div className="mt-8">
          <SignIn 
            path="/auth/entrar"
            routing="path"
            signUpUrl="/auth/cadastrar"
            redirectUrl="/dashboard"
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-xl border-0 bg-white/80 backdrop-blur-sm",
                headerTitle: "text-slate-900 font-semibold",
                headerSubtitle: "text-slate-600",
                socialButtonsBlockButton: "border-slate-200 hover:border-slate-300 text-slate-700",
                formFieldInput: "border-slate-200 focus:border-sky-500 focus:ring-sky-500",
                formButtonPrimary: "bg-sky-500 hover:bg-sky-600 text-white font-medium",
                footerActionLink: "text-sky-600 hover:text-sky-700",
                identityPreviewText: "text-slate-700",
                identityPreviewEditButton: "text-sky-600 hover:text-sky-700"
              },
              variables: {
                colorPrimary: "#0ea5e9",
                colorBackground: "rgba(255, 255, 255, 0.8)",
                colorInputBackground: "#f8fafc",
                borderRadius: "0.75rem"
              }
            }}
          />
        </div>

        {/* Healthcare compliance footer */}
        <div className="text-center text-xs text-slate-500 space-y-2">
          <p>
            Seus dados são protegidos conforme a Lei Geral de Proteção de Dados (LGPD)
          </p>
          <div className="flex justify-center space-x-4">
            <a href="/privacy" className="text-sky-600 hover:text-sky-700">
              Política de Privacidade
            </a>
            <span className="text-slate-300">•</span>
            <a href="/terms" className="text-sky-600 hover:text-sky-700">  
              Termos de Uso
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

// SEO and accessibility metadata
export const metadata = {
  title: 'Entrar - NeonPro Saúde',
  description: 'Acesso seguro ao sistema de gestão de saúde NeonPro com conformidade LGPD',
  robots: 'noindex, nofollow', // Prevent indexing of auth pages
}