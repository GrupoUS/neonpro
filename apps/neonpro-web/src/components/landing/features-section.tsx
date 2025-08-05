"use client";

import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Badge } from "@/components/ui/badge";
import type {
  Calendar,
  Users,
  BarChart3,
  Shield,
  Smartphone,
  Clock,
  HeartHandshake,
  Zap,
  Brain,
  FileText,
  CreditCard,
  UserCheck,
  CheckCircle,
  Star,
  TrendingUp,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "IA Preditiva para Agendamentos",
    description:
      "Algoritmos avançados que preveem no-shows, otimizam horários e sugerem os melhores slots para cada tipo de procedimento.",
    benefits: [
      "Reduz no-shows em 75%",
      "Otimização automática da agenda",
      "Previsão de demanda sazonal",
    ],
    category: "AI-Powered",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Calendar,
    title: "Agenda Inteligente Zero-Conflito",
    description:
      "Sistema de agendamento que elimina sobreposições, gerencia múltiplos profissionais e otimiza o fluxo de pacientes.",
    benefits: [
      "100% livre de conflitos",
      "Gestão multi-profissional",
      "Otimização de tempo ocioso",
    ],
    category: "Smart Scheduling",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Users,
    title: "CRM Especializado em Estética",
    description:
      "Gestão completa do relacionamento com pacientes, histórico de tratamentos e automação de follow-ups personalizados.",
    benefits: [
      "Histórico completo do paciente",
      "Follow-ups automatizados",
      "Segmentação inteligente",
    ],
    category: "Patient Care",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: BarChart3,
    title: "Business Intelligence Avançado",
    description:
      "Dashboards em tempo real com métricas de performance, análise de ROI por procedimento e previsões de receita.",
    benefits: ["Métricas em tempo real", "ROI por procedimento", "Previsões financeiras"],
    category: "Analytics",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Shield,
    title: "Compliance LGPD/ANVISA/CFM",
    description:
      "Conformidade automática com todas as regulamentações brasileiras, incluindo auditoria contínua e relatórios de compliance.",
    benefits: [
      "Auditoria automática 24/7",
      "Relatórios de conformidade",
      "Gestão de consentimentos",
    ],
    category: "Compliance",
    color: "from-red-500 to-pink-500",
  },
  {
    icon: Smartphone,
    title: "Portal do Paciente Mobile",
    description:
      "App PWA para pacientes com agendamento online, acompanhamento de tratamentos e comunicação direta com a clínica.",
    benefits: ["Agendamento 24/7", "Lembretes automáticos", "Avaliação pós-tratamento"],
    category: "Digital Experience",
    color: "from-indigo-500 to-purple-500",
  },
  {
    icon: FileText,
    title: "Prontuário Eletrônico Certificado",
    description:
      "Sistema de prontuário digital com assinatura eletrônica, fotos evolutivas e integração com equipamentos médicos.",
    benefits: [
      "Certificação digital ICP-Brasil",
      "Fotos evolutivas automáticas",
      "Integração com equipamentos",
    ],
    category: "Medical Records",
    color: "from-teal-500 to-green-500",
  },
  {
    icon: CreditCard,
    title: "Gestão Financeira Integrada",
    description:
      "Controle completo de receitas, despesas, comissões de profissionais e integração com gateways de pagamento.",
    benefits: ["Controle de fluxo de caixa", "Gestão de comissões", "Pagamentos online"],
    category: "Financial",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: UserCheck,
    title: "Gestão de Profissionais",
    description:
      "Sistema completo para gerenciar médicos, enfermeiros e staff, incluindo agenda individual e controle de permissões.",
    benefits: ["Agenda por profissional", "Controle de permissões", "Relatórios de produtividade"],
    category: "Team Management",
    color: "from-cyan-500 to-blue-500",
  },
];

const stats = [
  {
    value: "+85%",
    label: "Aumento nos Resultados",
    description: "Melhoria na taxa de sucesso dos tratamentos",
  },
  {
    value: "70%",
    label: "Redução Tempo Admin",
    description: "Menos tempo gasto em tarefas administrativas",
  },
  {
    value: "98%",
    label: "Satisfação do Paciente",
    description: "Índice de satisfação dos pacientes atendidos",
  },
  {
    value: "24/7",
    label: "Suporte Especializado",
    description: "Atendimento técnico especializado em saúde",
  },
];

export function FeaturesSection() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-16">
        <Badge className="mb-4 bg-[#6366f1]/10 text-[#6366f1] border-[#6366f1]/20">
          <Zap className="h-3 w-3 mr-1" />
          Recursos Avançados
        </Badge>

        <h2 className="text-4xl font-bold text-slate-900 mb-6">
          Tudo que sua Clínica Estética Precisa em{" "}
          <span className="bg-gradient-to-r from-[#6366f1] to-purple-600 bg-clip-text text-transparent">
            Uma Única Plataforma
          </span>
        </h2>

        <p className="text-xl text-slate-700 max-w-3xl mx-auto leading-relaxed">
          Sistema completo desenvolvido especificamente para clínicas estéticas brasileiras, com
          conformidade total às regulamentações nacionais e recursos de IA para maximizar seus
          resultados.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="text-center bg-gradient-to-br from-[#6366f1]/5 to-purple-500/5 border-[#6366f1]/20"
          >
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-[#6366f1] mb-2">{stat.value}</div>
              <div className="font-semibold text-slate-900 mb-1">{stat.label}</div>
              <div className="text-sm text-slate-600">{stat.description}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <Card
            key={index}
            className="group hover:shadow-xl transition-all duration-300 border-slate-200 hover:border-[#6366f1]/30"
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`h-12 w-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {feature.category}
                </Badge>
              </div>

              <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-[#6366f1] transition-colors">
                {feature.title}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-slate-700 leading-relaxed">{feature.description}</p>

              <div className="space-y-2">
                <div className="flex items-center text-sm font-medium text-slate-800 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Principais Benefícios:
                </div>
                <ul className="space-y-1">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center text-sm text-slate-600">
                      <Star className="h-3 w-3 text-[#6366f1] mr-2 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom CTA Section */}
      <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-[#6366f1] to-purple-600 text-white text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <TrendingUp className="h-8 w-8 text-yellow-300" />
            <h3 className="text-3xl font-bold">Transforme sua Clínica Hoje Mesmo</h3>
          </div>

          <p className="text-xl text-white/90 leading-relaxed">
            Junte-se a mais de <strong>500 clínicas</strong> que já revolucionaram seus resultados
            com o NeonPro. Teste gratuito por 30 dias, sem compromisso.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <div className="flex items-center text-white/90">
              <CheckCircle className="h-5 w-5 text-green-300 mr-2" />
              Configuração em 24 horas
            </div>
            <div className="flex items-center text-white/90">
              <CheckCircle className="h-5 w-5 text-green-300 mr-2" />
              Migração gratuita de dados
            </div>
            <div className="flex items-center text-white/90">
              <CheckCircle className="h-5 w-5 text-green-300 mr-2" />
              Treinamento da equipe incluso
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
