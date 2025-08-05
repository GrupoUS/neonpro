// components/landing/authentication-forms.tsx
"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationForms = AuthenticationForms;
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
function AuthenticationForms(_a) {
  var onProfessionalLogin = _a.onProfessionalLogin,
    onPatientLogin = _a.onPatientLogin;
  var professionalFeatures = [
    {
      icon: lucide_react_1.Stethoscope,
      title: "Dashboard Médico Completo",
      description: "Controle total da sua prática clínica",
    },
    {
      icon: lucide_react_1.Clock,
      title: "Agenda Inteligente",
      description: "IA otimiza automaticamente seus horários",
    },
    {
      icon: lucide_react_1.Shield,
      title: "Compliance Automático",
      description: "LGPD, ANVISA e CFM sempre em dia",
    },
  ];
  var patientFeatures = [
    {
      icon: lucide_react_1.Heart,
      title: "Cuidado Personalizado",
      description: "Acompanhamento completo do seu bem-estar",
    },
    {
      icon: lucide_react_1.Smartphone,
      title: "Acesso Mobile",
      description: "Gerencie tudo pelo seu smartphone",
    },
    {
      icon: lucide_react_1.UserCheck,
      title: "Dados Seguros",
      description: "Máxima proteção das suas informações",
    },
  ];
  return (
    <section className="py-16 lg:py-24 bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <badge_1.Badge className="mb-4 bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300">
            Acesso Personalizado
          </badge_1.Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Escolha seu Tipo de Acesso
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Interface especializada para profissionais de saúde e portal dedicado para pacientes
          </p>
        </div>

        {/* Authentication Cards */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Professional Access */}
          <card_1.Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 overflow-hidden">
            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-sky-600 to-blue-600 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                  <lucide_react_1.Stethoscope className="h-6 w-6" />
                </div>
                <badge_1.Badge className="bg-white/20 text-white border-white/30">
                  Profissionais
                </badge_1.Badge>
              </div>
              <card_1.CardTitle className="text-2xl font-bold mb-2">
                Acesso Profissional
              </card_1.CardTitle>
              <p className="text-sky-100 leading-relaxed">
                Dashboard completo para médicos, enfermeiros e gestores de clínicas estéticas e de
                beleza
              </p>
            </div>

            <card_1.CardContent className="p-6">
              {/* Features List */}
              <div className="space-y-4 mb-6">
                {professionalFeatures.map(function (feature, index) {
                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900 flex-shrink-0 mt-0.5">
                        <feature.icon className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                          {feature.title}
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Professional Access Features */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm">
                  Recursos Profissionais:
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-sky-600 rounded-full mr-2"></div>
                    Agenda inteligente
                  </div>
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-sky-600 rounded-full mr-2"></div>
                    Prontuário digital
                  </div>
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-sky-600 rounded-full mr-2"></div>
                    Analytics de BI
                  </div>
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-sky-600 rounded-full mr-2"></div>
                    Gestão financeira
                  </div>
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-sky-600 rounded-full mr-2"></div>
                    Compliance automático
                  </div>
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-sky-600 rounded-full mr-2"></div>
                    Relatórios ANVISA
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <button_1.Button
                onClick={onProfessionalLogin}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 text-base font-semibold group"
                size="lg"
              >
                Acessar Dashboard Profissional
                <lucide_react_1.ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button_1.Button>

              {/* Additional Info */}
              <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-4">
                Primeiro acesso? Entre em contato para ativação
              </p>
            </card_1.CardContent>
          </card_1.Card>

          {/* Patient Access */}
          <card_1.Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 overflow-hidden">
            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                  <lucide_react_1.Heart className="h-6 w-6" />
                </div>
                <badge_1.Badge className="bg-white/20 text-white border-white/30">
                  Pacientes
                </badge_1.Badge>
              </div>
              <card_1.CardTitle className="text-2xl font-bold mb-2">
                Portal do Paciente
              </card_1.CardTitle>
              <p className="text-pink-100 leading-relaxed">
                Acompanhe seus tratamentos, consultas e evolução de forma simples e segura
              </p>
            </div>

            <card_1.CardContent className="p-6">
              {/* Features List */}
              <div className="space-y-4 mb-6">
                {patientFeatures.map(function (feature, index) {
                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-100 dark:bg-pink-900 flex-shrink-0 mt-0.5">
                        <feature.icon className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                          {feature.title}
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Patient Access Features */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm">
                  Recursos do Paciente:
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-pink-600 rounded-full mr-2"></div>
                    Agendar consultas
                  </div>
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-pink-600 rounded-full mr-2"></div>
                    Histórico médico
                  </div>
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-pink-600 rounded-full mr-2"></div>
                    Fotos de progresso
                  </div>
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-pink-600 rounded-full mr-2"></div>
                    Lembretes automáticos
                  </div>
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-pink-600 rounded-full mr-2"></div>
                    Chat com a clínica
                  </div>
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-pink-600 rounded-full mr-2"></div>
                    Dados protegidos
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <button_1.Button
                onClick={onPatientLogin}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 text-base font-semibold group"
                size="lg"
              >
                Acessar Portal do Paciente
                <lucide_react_1.ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button_1.Button>

              {/* Additional Info */}
              <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-4">
                Primeiro acesso? Use CPF e celular para entrar
              </p>
            </card_1.CardContent>
          </card_1.Card>
        </div>

        {/* Security Notice */}
        <div className="mt-16 text-center">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <lucide_react_1.Shield className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Segurança e Privacidade Garantidas
              </h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Todos os dados são protegidos com criptografia de nível bancário e em total
              conformidade com a LGPD, ANVISA e regulamentações do CFM para máxima segurança das
              informações de saúde.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <badge_1.Badge variant="secondary" className="text-xs">
                Criptografia AES-256
              </badge_1.Badge>
              <badge_1.Badge variant="secondary" className="text-xs">
                LGPD Compliant
              </badge_1.Badge>
              <badge_1.Badge variant="secondary" className="text-xs">
                Certificação ANVISA
              </badge_1.Badge>
              <badge_1.Badge variant="secondary" className="text-xs">
                Auditoria Contínua
              </badge_1.Badge>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
