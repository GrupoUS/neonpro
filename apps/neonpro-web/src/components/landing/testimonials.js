// components/landing/testimonials.tsx
"use client";
"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Testimonials = Testimonials;
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var avatar_1 = require("@/components/ui/avatar");
var lucide_react_1 = require("lucide-react");
function Testimonials() {
    var testimonials = [
        {
            name: "Dr. Marina Silva",
            role: "Proprietária",
            clinic: "Clínica Bella Vita - São Paulo",
            avatar: "/avatars/dr-marina.jpg",
            fallback: "MS",
            rating: 5,
            quote: "O NeonPro revolucionou nossa operação. Reduzimos 85% dos conflitos de agenda e aumentamos 40% nossa eficiência. A IA realmente funciona!",
            metrics: {
                improvement: "+40% eficiência",
                reduction: "-85% conflitos",
                satisfaction: "98% pacientes"
            },
            verified: true
        },
        {
            name: "Carla Santos",
            role: "Coordenadora",
            clinic: "Estética Avançada - Rio de Janeiro",
            avatar: "/avatars/carla-santos.jpg",
            fallback: "CS",
            rating: 5,
            quote: "Como recepcionista, posso dizer que nunca foi tão fácil gerenciar a agenda. O sistema antecipa tudo e os pacientes adoram o portal deles!",
            metrics: {
                improvement: "+60% produtividade",
                reduction: "-90% no-shows",
                satisfaction: "95% equipe"
            },
            verified: true
        },
        {
            name: "Dr. Roberto Lima",
            role: "Médico Dermatologista",
            clinic: "Dermatologia Premium - Brasília",
            avatar: "/avatars/dr-roberto.jpg",
            fallback: "RL",
            rating: 5,
            quote: "A conformidade automática com ANVISA e CFM me dá total tranquilidade. Foco no que importa: cuidar dos meus pacientes.",
            metrics: {
                improvement: "+30% pacientes",
                reduction: "0 multas compliance",
                satisfaction: "100% auditoria"
            },
            verified: true
        },
        {
            name: "Ana Costa",
            role: "Paciente",
            clinic: "Usuária do Portal",
            avatar: "/avatars/ana-costa.jpg",
            fallback: "AC",
            rating: 5,
            quote: "Acompanho meu tratamento pelo app, vejo meu progresso e me sinto muito mais segura. A transparência é total!",
            metrics: {
                improvement: "+50% confiança",
                reduction: "-70% ansiedade",
                satisfaction: "Recomendo 100%"
            },
            verified: false
        },
        {
            name: "Dr. Fernanda Oliveira",
            role: "Cirurgiã Plástica",
            clinic: "Instituto de Beleza - Curitiba",
            avatar: "/avatars/dr-fernanda.jpg",
            fallback: "FO",
            rating: 5,
            quote: "Os analytics são impressionantes. Consigo prever a demanda e otimizar meu tempo. Meu faturamento cresceu 35% em 6 meses.",
            metrics: {
                improvement: "+35% faturamento",
                reduction: "+25% margem",
                satisfaction: "92% retenção"
            },
            verified: true
        },
        {
            name: "Lucas Pereira",
            role: "Gestor de TI",
            clinic: "Rede BeautyMed - Nacional",
            avatar: "/avatars/lucas-pereira.jpg",
            fallback: "LP",
            rating: 5,
            quote: "Implementamos em 12 clínicas simultaneamente. Zero problemas, compliance total e ROI positivo em 3 meses. Excepcional!",
            metrics: {
                improvement: "12 clínicas",
                reduction: "ROI 3 meses",
                satisfaction: "100% uptime"
            },
            verified: true
        }
    ];
    var stats = [
        {
            icon: lucide_react_1.Users,
            value: "500+",
            label: "Clínicas Ativas",
            description: "Em todo o Brasil"
        },
        {
            icon: lucide_react_1.Heart,
            value: "50k+",
            label: "Pacientes Atendidos",
            description: "Mensalmente"
        },
        {
            icon: lucide_react_1.TrendingUp,
            value: "40%",
            label: "Aumento Médio",
            description: "Na eficiência"
        },
        {
            icon: lucide_react_1.Clock,
            value: "99.9%",
            label: "Uptime",
            description: "Disponibilidade"
        }
    ];
    return (<section className="py-16 lg:py-24 bg-white dark:bg-slate-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <badge_1.Badge className="mb-4 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
            Casos de Sucesso
          </badge_1.Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Transformando Clínicas em
            <span className="block text-sky-600">Todo o Brasil</span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Veja como profissionais e pacientes estão alcançando resultados excepcionais 
            com nossa plataforma de saúde digital.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {stats.map(function (stat, index) { return (<div key={index} className="text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 mx-auto mb-4">
                <stat.icon className="h-8 w-8 text-white"/>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {stat.label}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {stat.description}
              </div>
            </div>); })}
        </div>

        {/* Testimonials Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {testimonials.map(function (testimonial, index) { return (<card_1.Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
              <card_1.CardContent className="p-6">
                {/* Quote Icon */}
                <div className="flex items-start justify-between mb-4">
                  <lucide_react_1.Quote className="h-8 w-8 text-sky-600 opacity-50"/>
                  <div className="flex items-center space-x-1">
                    {__spreadArray([], Array(testimonial.rating), true).map(function (_, i) { return (<lucide_react_1.Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400"/>); })}
                  </div>
                </div>

                {/* Quote */}
                <blockquote className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6 italic">
                  "{testimonial.quote}"
                </blockquote>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {Object.entries(testimonial.metrics).map(function (_a, idx) {
                var key = _a[0], value = _a[1];
                return (<div key={idx} className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {value}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                        {key.replace('_', ' ')}
                      </div>
                    </div>);
            })}
                </div>

                {/* Author */}
                <div className="flex items-center space-x-3">
                  <avatar_1.Avatar className="h-12 w-12">
                    <avatar_1.AvatarImage src={testimonial.avatar} alt={testimonial.name}/>
                    <avatar_1.AvatarFallback className="bg-sky-100 text-sky-700 font-semibold">
                      {testimonial.fallback}
                    </avatar_1.AvatarFallback>
                  </avatar_1.Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        {testimonial.name}
                      </h4>
                      {testimonial.verified && (<badge_1.Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs">
                          Verificado
                        </badge_1.Badge>)}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {testimonial.role}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {testimonial.clinic}
                    </p>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>); })}
        </div>

        {/* Video Testimonial Section */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 lg:p-12 text-center">
          <badge_1.Badge className="mb-4 bg-white/20 text-white">
            Depoimento em Vídeo
          </badge_1.Badge>
          <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">
            "Como o NeonPro Transformou Nossa Clínica"
          </h3>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
            Assista ao depoimento completo da Dr. Marina Silva, proprietária da Clínica Bella Vita, 
            sobre como nossa plataforma revolucionou sua operação.
          </p>
          
          {/* Video Placeholder */}
          <div className="relative bg-slate-700 rounded-xl overflow-hidden max-w-4xl mx-auto mb-8">
            <div className="aspect-video flex items-center justify-center">
              <div className="flex items-center justify-center w-20 h-20 bg-white/20 rounded-full hover:bg-white/30 transition-colors cursor-pointer">
                <div className="w-0 h-0 border-l-8 border-l-white border-y-6 border-y-transparent ml-1"></div>
              </div>
            </div>
            {/* Video Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent"></div>
            <div className="absolute bottom-4 left-4 text-white">
              <div className="text-sm font-semibold">Dr. Marina Silva</div>
              <div className="text-xs opacity-75">Clínica Bella Vita</div>
            </div>
            <div className="absolute top-4 right-4">
              <badge_1.Badge className="bg-red-600 text-white text-xs">
                AO VIVO
              </badge_1.Badge>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-slate-900 px-8 py-3 rounded-lg font-semibold hover:bg-slate-100 transition-colors">
              Assistir Depoimento
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
              Mais Casos de Sucesso
            </button>
          </div>
        </div>
      </div>
    </section>);
}
