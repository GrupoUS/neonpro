import { UserProfile } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function PerfilPage() {
  const { userId } = auth()
  
  // Redirect unauthenticated users
  if (!userId) {
    redirect('/auth/entrar')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Healthcare-focused header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Perfil Profissional
          </h1>
          <p className="text-slate-600">
            Gerencie suas informações profissionais e configurações de conta
          </p>
          <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            🔒 Dados protegidos pela LGPD
          </div>
        </div>

        {/* Clerk UserProfile Component */}
        <div className="flex justify-center">
          <UserProfile 
            path="/perfil"
            routing="path"
            appearance={{
              elements: {
                rootBox: "w-full max-w-4xl",
                card: "shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl",
                navbar: "bg-slate-50 rounded-t-2xl",
                navbarButton: "text-slate-700 hover:text-sky-600 hover:bg-sky-50",
                navbarButtonActive: "text-sky-600 bg-sky-100",
                pageScrollBox: "bg-white rounded-b-2xl",
                headerTitle: "text-slate-900 font-semibold",
                headerSubtitle: "text-slate-600",
                formButtonPrimary: "bg-sky-500 hover:bg-sky-600 text-white font-medium",
                formFieldInput: "border-slate-200 focus:border-sky-500 focus:ring-sky-500",
                accordionTriggerButton: "text-slate-700 hover:text-slate-900",
                badge: "bg-sky-100 text-sky-800",
                formFieldSuccessText: "text-emerald-600",
                formFieldErrorText: "text-red-600",
                identityPreviewText: "text-slate-700",
                identityPreviewEditButton: "text-sky-600 hover:text-sky-700"
              },
              variables: {
                colorPrimary: "#0ea5e9",
                colorBackground: "rgba(255, 255, 255, 0.9)",
                colorInputBackground: "#f8fafc",
                borderRadius: "0.75rem",
                colorSuccess: "#10b981",
                colorDanger: "#ef4444"
              }
            }}
          />
        </div>

        {/* Healthcare compliance information */}
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              🏥 Informações para Profissionais de Saúde
            </h3>
            <div className="space-y-3 text-sm text-blue-800">
              <p>
                <strong>Proteção de Dados:</strong> Todas as informações são criptografadas e 
                armazenadas em conformidade com a LGPD e normas do CFM.
              </p>
              <p>
                <strong>Registro Profissional:</strong> Mantenha seus dados de registro 
                profissional sempre atualizados para garantir o acesso completo ao sistema.
              </p>
              <p>
                <strong>Segurança:</strong> Recomendamos ativar a autenticação de dois fatores 
                para máxima segurança dos dados dos pacientes.
              </p>
            </div>
          </div>

          {/* LGPD Rights Information */}
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-amber-900 mb-3">
              ⚖️ Seus Direitos sob a LGPD
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-amber-800">
              <div>
                <p className="font-medium">Acesso e Portabilidade</p>
                <p>Solicite uma cópia dos seus dados pessoais</p>
              </div>
              <div>
                <p className="font-medium">Correção</p>
                <p>Atualize informações incorretas ou incompletas</p>
              </div>
              <div>
                <p className="font-medium">Exclusão (Direito ao Esquecimento)</p>
                <p>Solicite a remoção dos seus dados pessoais</p>
              </div>
              <div>
                <p className="font-medium">Limitação do Tratamento</p>
                <p>Limite como seus dados são processados</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-amber-200">
              <p className="text-xs text-amber-700">
                Para exercer seus direitos, entre em contato com nosso DPO: 
                <a href="mailto:dpo@neonpro.com.br" className="text-amber-900 hover:underline font-medium">
                  dpo@neonpro.com.br
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Perfil Profissional - NeonPro Saúde',
  description: 'Gerencie seu perfil profissional e configurações de conta com segurança LGPD',
}