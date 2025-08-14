// app/login/page.tsx
import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-sky-50 p-4">
      <div className="w-full max-w-md">
        {/* Healthcare compliance notice */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            NeonPro - Acesso Seguro
          </h1>
          <p className="text-sm text-slate-600">
            Sistema em conformidade com LGPD para profissionais de saúde
          </p>
        </div>
        
        {/* Clerk SignIn Component with Healthcare Styling */}
        <SignIn 
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
              card: 
                'bg-white shadow-xl border border-slate-200 rounded-xl p-6',
              headerTitle: 
                'text-slate-900 font-semibold text-xl',
              headerSubtitle: 
                'text-slate-600 text-sm mt-1',
              socialButtonsBlockButton: 
                'border border-slate-300 hover:border-slate-400 text-slate-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200',
              formFieldInput: 
                'border border-slate-300 focus:border-sky-500 focus:ring-sky-500 rounded-lg px-3 py-2',
              footerActionText: 
                'text-slate-600 text-sm',
              footerActionLink: 
                'text-sky-600 hover:text-sky-700 font-medium text-sm',
            }
          }}
          redirectUrl="/dashboard"
          routing="path"
          path="/login"
        />
        
        {/* Healthcare compliance footer */}
        <div className="mt-6 text-center text-xs text-slate-500">
          <p>Dados protegidos conforme LGPD • Acesso seguro para profissionais de saúde</p>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Login - NeonPro',
  description: 'Acesso seguro para profissionais de saúde - Sistema em conformidade com LGPD',
  robots: 'index, follow',
}
