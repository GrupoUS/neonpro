"use client";

import type {
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle,
  Heart,
  Play,
  Shield,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent } from "@/components/ui/card";

interface HeroSectionProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export function HeroSection({ onLoginClick, onRegisterClick }: HeroSectionProps) {
  return (
    <section className="relative py-20 bg-gradient-to-br from-purple-600 via-purple-700 to-purple-500 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/20 blur-xl"></div>
        <div className="absolute top-40 right-20 w-48 h-48 rounded-full bg-white/10 blur-2xl"></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 rounded-full bg-white/15 blur-xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white space-y-8">
            {/* Trust Badges */}
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-white/20 backdrop-blur text-white border-white/30 hover:bg-white/30">
                <Shield className="h-3 w-3 mr-1" />
                LGPD Compliant
              </Badge>
              <Badge className="bg-white/20 backdrop-blur text-white border-white/30 hover:bg-white/30">
                <CheckCircle className="h-3 w-3 mr-1" />
                ANVISA Certified
              </Badge>
              <Badge className="bg-white/20 backdrop-blur text-white border-white/30 hover:bg-white/30">
                <Heart className="h-3 w-3 mr-1" />
                CFM Approved
              </Badge>
            </div>

            {/* Main Headline */}
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Revolução Digital para{" "}
                <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                  Clínicas Estéticas
                </span>
              </h1>

              <p className="text-xl lg:text-2xl text-white/90 leading-relaxed max-w-xl">
                Plataforma AI-powered que transforma sua clínica estética em um centro de
                excelência, aumentando resultados em <strong>+85%</strong> e reduzindo tempo
                administrativo em <strong>70%</strong>.
              </p>
            </div>
            {/* Key Stats */}
            <div className="grid grid-cols-3 gap-6 py-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-300">+500</div>
                <div className="text-sm text-white/80">Clínicas Ativas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-300">98%</div>
                <div className="text-sm text-white/80">Satisfação</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-300">24/7</div>
                <div className="text-sm text-white/80">Suporte Técnico</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={onLoginClick}
                className="bg-white text-purple-600 hover:bg-white/90 font-semibold shadow-xl h-14 px-8"
              >
                <Heart className="h-5 w-5 mr-2" />
                Começar Agora
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={onRegisterClick}
                className="border-white/30 text-white hover:bg-white/10 backdrop-blur font-medium h-14 px-8"
              >
                <Users className="h-5 w-5 mr-2" />
                Portal do Paciente
              </Button>
            </div>

            {/* Demo CTA */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-white/80 hover:text-white hover:bg-white/10 p-0"
              >
                <Play className="h-4 w-4 mr-2" />
                Ver demonstração (2 min)
              </Button>
              <span className="text-white/60">•</span>
              <span className="text-sm text-white/80">Sem compromisso, teste gratuito</span>
            </div>
          </div>
          {/* Right Content - Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* AI Intelligence Card */}
            <Card className="bg-white/10 backdrop-blur border-white/20 text-white hover:bg-white/15 transition-all duration-300">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">IA Preditiva</h3>
                    <p className="text-white/80 text-sm">Otimização automática</p>
                  </div>
                </div>
                <p className="text-white/90 text-sm leading-relaxed">
                  Algoritmos de ML preveem no-shows, otimizam agendas e sugerem tratamentos
                  personalizados para cada paciente.
                </p>
                <div className="flex items-center text-yellow-300 text-sm">
                  <Star className="h-4 w-4 mr-1" />
                  <span>+45% eficiência operacional</span>
                </div>
              </CardContent>
            </Card>

            {/* Smart Scheduling Card */}
            <Card className="bg-white/10 backdrop-blur border-white/20 text-white hover:bg-white/15 transition-all duration-300">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-400 to-indigo-400 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Agenda Smart</h3>
                    <p className="text-white/80 text-sm">Conflito zero</p>
                  </div>
                </div>
                <p className="text-white/90 text-sm leading-relaxed">
                  Sistema inteligente que elimina conflitos de horário, otimiza intervalos e
                  maximiza a ocupação da agenda.
                </p>
                <div className="flex items-center text-yellow-300 text-sm">
                  <Star className="h-4 w-4 mr-1" />
                  <span>-90% conflitos de agenda</span>
                </div>
              </CardContent>
            </Card>
            {/* Analytics Card */}
            <Card className="bg-white/10 backdrop-blur border-white/20 text-white hover:bg-white/15 transition-all duration-300">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">BI Avançado</h3>
                    <p className="text-white/80 text-sm">Insights em tempo real</p>
                  </div>
                </div>
                <p className="text-white/90 text-sm leading-relaxed">
                  Dashboards inteligentes com métricas de performance, previsões de receita e
                  análise de satisfação do paciente.
                </p>
                <div className="flex items-center text-yellow-300 text-sm">
                  <Star className="h-4 w-4 mr-1" />
                  <span>+120% ROI médio</span>
                </div>
              </CardContent>
            </Card>

            {/* Compliance Card */}
            <Card className="bg-white/10 backdrop-blur border-white/20 text-white hover:bg-white/15 transition-all duration-300">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-red-400 to-pink-400 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Compliance</h3>
                    <p className="text-white/80 text-sm">Total conformidade</p>
                  </div>
                </div>
                <p className="text-white/90 text-sm leading-relaxed">
                  Atendimento automático às normas LGPD, ANVISA e CFM, com auditoria contínua e
                  relatórios de conformidade.
                </p>
                <div className="flex items-center text-yellow-300 text-sm">
                  <Star className="h-4 w-4 mr-1" />
                  <span>100% conformidade legal</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Bottom Trust Indicators */}
        <div className="mt-16 pt-8 border-t border-white/20">
          <div className="text-center text-white/80 space-y-4">
            <p className="text-sm">Confiado por clínicas líderes em todo o Brasil</p>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              <div className="h-8 bg-white/20 rounded px-4 flex items-center text-xs font-medium">
                ANVISA
              </div>
              <div className="h-8 bg-white/20 rounded px-4 flex items-center text-xs font-medium">
                CFM
              </div>
              <div className="h-8 bg-white/20 rounded px-4 flex items-center text-xs font-medium">
                LGPD
              </div>
              <div className="h-8 bg-white/20 rounded px-4 flex items-center text-xs font-medium">
                ISO 27001
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
