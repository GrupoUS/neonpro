// components/landing/feature-highlights.tsx
"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureHighlights = FeatureHighlights;
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var separator_1 = require("@/components/ui/separator");
var lucide_react_1 = require("lucide-react");
function FeatureHighlights() {
  var complianceFeatures = [
    {
      icon: lucide_react_1.ShieldCheck,
      title: "LGPD Compliance Automático",
      description: "Proteção total de dados pessoais conforme Lei 13.709/2018",
      details: [
        "Consentimento digital automático",
        "Relatórios de auditoria em tempo real",
        "Criptografia end-to-end",
        "Direito ao esquecimento",
      ],
      badge: "LGPD 2020",
    },
    {
      icon: lucide_react_1.Award,
      title: "Certificação ANVISA",
      description: "Sistema como Dispositivo Médico aprovado pela ANVISA",
      details: [
        "Classificação de risco automática",
        "Relatórios regulatórios",
        "Controle de qualidade integrado",
        "Rastreabilidade completa",
      ],
      badge: "ANVISA",
    },
    {
      icon: lucide_react_1.FileCheck,
      title: "Resolução CFM 2.314/2022",
      description: "Telemedicina e prontuário eletrônico em conformidade",
      details: [
        "Consultas virtuais certificadas",
        "Assinatura digital médica",
        "Prescrição eletrônica",
        "Histórico médico seguro",
      ],
      badge: "CFM",
    },
  ];
  var intelligentFeatures = [
    {
      icon: lucide_react_1.Brain,
      title: "IA Preditiva Avançada",
      description: "Algoritmos proprietários para otimização de resultados",
      stats: "85% redução em conflitos de agenda",
    },
    {
      icon: lucide_react_1.Zap,
      title: "Automação Inteligente",
      description: "Fluxos de trabalho automatizados com IA",
      stats: "40% aumento na eficiência operacional",
    },
    {
      icon: lucide_react_1.TrendingUp,
      title: "Analytics Preditivo",
      description: "Insights de negócio com machine learning",
      stats: "95% precisão em previsões de demanda",
    },
    {
      icon: lucide_react_1.Heart,
      title: "Wellness Intelligence",
      description: "Acompanhamento holístico do bem-estar",
      stats: "92% satisfação dos pacientes",
    },
  ];
  var coreFeatures = [
    {
      icon: lucide_react_1.Clock,
      title: "Agendamento Inteligente",
      description: "IA otimiza automaticamente sua agenda",
    },
    {
      icon: lucide_react_1.Users,
      title: "Gestão de Pacientes",
      description: "Prontuário digital completo e seguro",
    },
    {
      icon: lucide_react_1.Database,
      title: "Business Intelligence",
      description: "Dashboards avançados em tempo real",
    },
    {
      icon: lucide_react_1.Smartphone,
      title: "Mobile-First",
      description: "Acesso total via smartphone e tablet",
    },
  ];
  return (
    <section className="py-16 lg:py-24 bg-white dark:bg-slate-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <badge_1.Badge className="mb-4 bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300">
            Tecnologia Avançada
          </badge_1.Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Plataforma Completa para
            <span className="block text-sky-600">Clínicas Estéticas Brasileiras</span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Sistema integrado com IA, compliance automático e ferramentas especializadas para
            maximizar resultados e satisfação dos pacientes.
          </p>
        </div>

        {/* Compliance Features */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Compliance Brasileiro Automático
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Atenda automaticamente todas as exigências regulatórias brasileiras
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {complianceFeatures.map(function (feature, index) {
              return (
                <card_1.Card
                  key={index}
                  className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800"
                >
                  <card_1.CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-600">
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <badge_1.Badge variant="secondary" className="text-xs font-semibold">
                        {feature.badge}
                      </badge_1.Badge>
                    </div>
                    <card_1.CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
                      {feature.title}
                    </card_1.CardTitle>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </card_1.CardHeader>
                  <card_1.CardContent className="pt-0">
                    <separator_1.Separator className="mb-4" />
                    <ul className="space-y-2">
                      {feature.details.map(function (detail, idx) {
                        return (
                          <li
                            key={idx}
                            className="flex items-center text-sm text-slate-600 dark:text-slate-400"
                          >
                            <div className="w-1.5 h-1.5 bg-sky-600 rounded-full mr-3 flex-shrink-0"></div>
                            {detail}
                          </li>
                        );
                      })}
                    </ul>
                  </card_1.CardContent>
                </card_1.Card>
              );
            })}
          </div>
        </div>

        {/* AI Features */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Inteligência Artificial Proprietária
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Algoritmos avançados desenvolvidos especificamente para clínicas estéticas
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {intelligentFeatures.map(function (feature, index) {
              return (
                <card_1.Card
                  key={index}
                  className="text-center border-0 shadow-md hover:shadow-lg transition-shadow"
                >
                  <card_1.CardContent className="pt-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 mx-auto mb-4">
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
                      {feature.description}
                    </p>
                    <badge_1.Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs font-semibold">
                      {feature.stats}
                    </badge_1.Badge>
                  </card_1.CardContent>
                </card_1.Card>
              );
            })}
          </div>
        </div>

        {/* Core Features Grid */}
        <div>
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Recursos Essenciais
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Tudo que sua clínica precisa em uma única plataforma
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreFeatures.map(function (feature, index) {
              return (
                <div key={index} className="group cursor-pointer">
                  <div className="flex flex-col items-center text-center p-6 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-sky-100 dark:group-hover:bg-sky-900 transition-colors mb-4">
                      <feature.icon className="h-6 w-6 text-slate-600 dark:text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors" />
                    </div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-sky-600 to-blue-600 rounded-2xl p-8 lg:p-12">
            <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">
              Pronto para Revolucionar sua Clínica?
            </h3>
            <p className="text-sky-100 text-lg mb-6 max-w-2xl mx-auto">
              Junte-se a mais de 500 clínicas que já transformaram seus resultados com o NeonPro
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-sky-600 px-8 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-colors">
                Demonstração Gratuita
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                Falar com Especialista
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
