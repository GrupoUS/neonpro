"use client";
var __spreadArray =
  (this && this.__spreadArray) ||
  ((to, from, pack) => {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestimonialsSection = TestimonialsSection;
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var avatar_1 = require("@/components/ui/avatar");
var lucide_react_1 = require("lucide-react");
var testimonials = [
  {
    id: 1,
    name: "Dra. Marina Oliveira",
    role: "Proprietária",
    clinic: "Clínica Estética Bella Vita",
    location: "São Paulo, SP",
    avatar: "/testimonials/marina.jpg",
    rating: 5,
    quote:
      "O NeonPro revolucionou nossa clínica! Aumentamos nossa receita em 120% no primeiro ano e eliminamos completamente os conflitos de agendamento. A IA preditiva é impressionante.",
    metrics: {
      revenue: "+120%",
      efficiency: "+85%",
      satisfaction: "98%",
    },
    category: "Growth Success",
    specialty: "Harmonização Facial",
  },
  {
    id: 2,
    name: "Dr. Carlos Mendes",
    role: "Diretor Médico",
    clinic: "Instituto de Medicina Estética",
    location: "Rio de Janeiro, RJ",
    avatar: "/testimonials/carlos.jpg",
    rating: 5,
    quote:
      "A conformidade com LGPD e ANVISA é automática, o que nos dá total tranquilidade. O prontuário eletrônico certificado agilizou drasticamente nossas consultas e melhorou a qualidade do atendimento.",
    metrics: {
      compliance: "100%",
      timeReduction: "60%",
      patientSatisfaction: "97%",
    },
    category: "Compliance & Quality",
    specialty: "Dermatologia Estética",
  },
  {
    id: 3,
    name: "Carla Fernandes",
    role: "Coordenadora",
    clinic: "Estética & Bem-Estar Premium",
    location: "Belo Horizonte, MG",
    avatar: "/testimonials/carla.jpg",
    rating: 5,
    quote:
      "Como coordenadora, o NeonPro facilitou imensamente meu trabalho. O sistema prevê no-shows com 90% de precisão e a agenda inteligente otimiza automaticamente nossos horários. Incrível!",
    metrics: {
      noShowReduction: "75%",
      scheduleOptimization: "90%",
      adminTime: "-70%",
    },
    category: "Operational Excellence",
    specialty: "Gestão Clínica",
  },
  {
    id: 4,
    name: "Ana Paula Costa",
    role: "Paciente",
    clinic: "Tratamento em Múltiplas Clínicas",
    location: "Brasília, DF",
    avatar: "/testimonials/ana.jpg",
    rating: 5,
    quote:
      "O portal do paciente é fantástico! Consigo agendar consultas 24/7, acompanhar meu progresso com fotos e receber lembretes personalizados. Me sinto muito mais segura e informada sobre meus tratamentos.",
    metrics: {
      convenience: "24/7",
      engagement: "+300%",
      satisfaction: "99%",
    },
    category: "Patient Experience",
    specialty: "Experiência do Paciente",
  },
  {
    id: 5,
    name: "Dr. Roberto Silva",
    role: "Dermatologista",
    clinic: "Clínica Derma Excellence",
    location: "Porto Alegre, RS",
    avatar: "/testimonials/roberto.jpg",
    rating: 5,
    quote:
      "Os dashboards de BI me dão insights incríveis sobre minha prática. Posso ver qual tratamento tem melhor ROI, prever demanda sazonal e otimizar minha estratégia comercial com dados reais.",
    metrics: {
      roi: "+150%",
      insights: "Real-time",
      decisionSpeed: "+200%",
    },
    category: "Business Intelligence",
    specialty: "Dermatologia Clínica",
  },
  {
    id: 6,
    name: "Juliana Rodrigues",
    role: "Enfermeira Estética",
    clinic: "Centro de Estética Avançada",
    location: "Recife, PE",
    avatar: "/testimonials/juliana.jpg",
    rating: 5,
    quote:
      "A integração com equipamentos médicos automatizou nossos protocolos. As fotos evolutivas são capturadas automaticamente e o sistema sugere os melhores tratamentos baseado no histórico do paciente.",
    metrics: {
      automation: "95%",
      accuracy: "98%",
      efficiency: "+180%",
    },
    category: "Medical Integration",
    specialty: "Procedimentos Estéticos",
  },
];
var overallStats = [
  {
    icon: lucide_react_1.TrendingUp,
    value: "+500",
    label: "Clínicas Ativas",
    description: "Em todo o Brasil",
  },
  {
    icon: lucide_react_1.Users,
    value: "50,000+",
    label: "Pacientes Atendidos",
    description: "Mensalmente",
  },
  {
    icon: lucide_react_1.Calendar,
    value: "99.8%",
    label: "Uptime",
    description: "Disponibilidade garantida",
  },
  {
    icon: lucide_react_1.Heart,
    value: "4.9/5",
    label: "Avaliação Média",
    description: "Satisfaction score",
  },
];
function TestimonialsSection() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-16">
        <badge_1.Badge className="mb-4 bg-[#6366f1]/10 text-[#6366f1] border-[#6366f1]/20">
          <lucide_react_1.Star className="h-3 w-3 mr-1" />
          Depoimentos Reais
        </badge_1.Badge>

        <h2 className="text-4xl font-bold text-slate-900 mb-6">
          Histórias de Sucesso de{" "}
          <span className="bg-gradient-to-r from-[#6366f1] to-purple-600 bg-clip-text text-transparent">
            Profissionais como Você
          </span>
        </h2>

        <p className="text-xl text-slate-700 max-w-3xl mx-auto leading-relaxed">
          Descubra como médicos, coordenadores e pacientes estão transformando a experiência
          estética com o NeonPro em todo o Brasil.
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        {overallStats.map((stat, index) => (
          <card_1.Card
            key={index}
            className="text-center bg-white border-slate-200 hover:border-[#6366f1]/30 transition-colors"
          >
            <card_1.CardContent className="p-6">
              <div className="flex justify-center mb-3">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#6366f1] to-purple-600 flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-2">{stat.value}</div>
              <div className="font-semibold text-slate-800 mb-1">{stat.label}</div>
              <div className="text-sm text-slate-600">{stat.description}</div>
            </card_1.CardContent>
          </card_1.Card>
        ))}
      </div>

      {/* Testimonials Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {testimonials.map((testimonial) => (
          <card_1.Card
            key={testimonial.id}
            className="group hover:shadow-xl transition-all duration-300 border-slate-200 hover:border-[#6366f1]/30"
          >
            <card_1.CardContent className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <avatar_1.Avatar className="h-12 w-12 border-2 border-[#6366f1]/20">
                    <avatar_1.AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <avatar_1.AvatarFallback className="bg-gradient-to-br from-[#6366f1] to-purple-600 text-white font-semibold">
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </avatar_1.AvatarFallback>
                  </avatar_1.Avatar>
                  <div>
                    <h4 className="font-semibold text-slate-900">{testimonial.name}</h4>
                    <p className="text-sm text-slate-600">{testimonial.role}</p>
                    <p className="text-xs text-slate-500">{testimonial.location}</p>
                  </div>
                </div>
                <badge_1.Badge variant="secondary" className="text-xs">
                  {testimonial.category}
                </badge_1.Badge>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-1">
                {__spreadArray([], Array(testimonial.rating), true).map((_, i) => (
                  <lucide_react_1.Star
                    key={i}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
                <span className="text-sm text-slate-600 ml-2">{testimonial.rating}.0</span>
              </div>

              {/* Quote */}
              <div className="relative">
                <lucide_react_1.Quote className="h-8 w-8 text-[#6366f1]/20 absolute -top-2 -left-1" />
                <p className="text-slate-700 leading-relaxed pl-6 italic">"{testimonial.quote}"</p>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100">
                {Object.entries(testimonial.metrics).map((_a, index) => {
                  var key = _a[0],
                    value = _a[1];
                  return (
                    <div key={index} className="text-center">
                      <div className="text-lg font-bold text-[#6366f1]">{value}</div>
                      <div className="text-xs text-slate-600 capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Clinic Info */}
              <div className="text-center pt-2">
                <p className="text-sm font-medium text-slate-800">{testimonial.clinic}</p>
                <p className="text-xs text-slate-600">Especialidade: {testimonial.specialty}</p>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        ))}
      </div>

      {/* Success Metrics Summary */}
      <div className="bg-gradient-to-br from-[#6366f1] to-purple-600 rounded-2xl p-8 text-white text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h3 className="text-3xl font-bold mb-4">Resultados Comprovados em Números</h3>
            <p className="text-xl text-white/90 leading-relaxed">
              Mais de 500 clínicas já transformaram seus resultados com o NeonPro. Veja o impacto
              real em diferentes áreas da sua clínica.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur rounded-lg p-6">
              <lucide_react_1.BarChart3 className="h-8 w-8 text-yellow-300 mx-auto mb-3" />
              <div className="text-3xl font-bold mb-1">+127%</div>
              <div className="text-sm text-white/90">Crescimento Médio de Receita</div>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-lg p-6">
              <lucide_react_1.Clock className="h-8 w-8 text-green-300 mx-auto mb-3" />
              <div className="text-3xl font-bold mb-1">-68%</div>
              <div className="text-sm text-white/90">Redução Tempo Admin</div>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-lg p-6">
              <lucide_react_1.Users className="h-8 w-8 text-blue-300 mx-auto mb-3" />
              <div className="text-3xl font-bold mb-1">98.2%</div>
              <div className="text-sm text-white/90">Satisfação dos Pacientes</div>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-lg p-6">
              <lucide_react_1.CheckCircle className="h-8 w-8 text-pink-300 mx-auto mb-3" />
              <div className="text-3xl font-bold mb-1">100%</div>
              <div className="text-sm text-white/90">Conformidade Legal</div>
            </div>
          </div>

          <div className="pt-4">
            <button_1.Button
              size="lg"
              className="bg-white text-[#6366f1] hover:bg-white/90 font-semibold shadow-xl"
            >
              Quero Estes Resultados na Minha Clínica
            </button_1.Button>
          </div>
        </div>
      </div>
    </div>
  );
}
