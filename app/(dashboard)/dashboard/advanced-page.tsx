/**
 * NEONPROV1 - Dashboard Avançado com 21st dev components
 * Dashboard premium com componentes visuais aprimorados
 */
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Users, 
  Calendar, 
  TrendingUp, 
  Heart, 
  Stethoscope,
  UserCheck,
  Clock,
  Plus,
  Bell,
  Search,
  DollarSign,
  ChevronRight,
  BarChart3,
  MessageCircle,
  Star,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AppLayout } from "@/components/neonpro";

// NeonGradientCard Component com cores NEONPROV1
interface NeonColorsProps {
  firstColor: string;
  secondColor: string;
}

interface NeonGradientCardProps {
  className?: string;
  children?: React.ReactNode;
  borderSize?: number;
  borderRadius?: number;
  neonColors?: NeonColorsProps;
}

const NeonGradientCard: React.FC<NeonGradientCardProps> = ({
  className,
  children,
  borderSize = 2,
  borderRadius = 20,
  neonColors = {
    firstColor: "#1E40AF", // NEONPROV1 Primary
    secondColor: "#3B82F6", // NEONPROV1 Secondary
  },
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setDimensions({ width: offsetWidth, height: offsetHeight });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        "--border-size": `${borderSize}px`,
        "--border-radius": `${borderRadius}px`,
        "--neon-first-color": neonColors.firstColor,
        "--neon-second-color": neonColors.secondColor,
        "--card-width": `${dimensions.width}px`,
        "--card-height": `${dimensions.height}px`,
        "--card-content-radius": `${borderRadius - borderSize}px`,
        "--pseudo-element-width": `${dimensions.width + borderSize * 2}px`,
        "--pseudo-element-height": `${dimensions.height + borderSize * 2}px`,
        "--after-blur": `${dimensions.width / 3}px`,
      } as React.CSSProperties}
      className={cn(
        "relative z-10 size-full rounded-[var(--border-radius)]",
        className,
      )}
    >
      <div
        className={cn(
          "relative size-full min-h-[inherit] rounded-[var(--card-content-radius)] bg-background p-6",
          "before:absolute before:-left-[var(--border-size)] before:-top-[var(--border-size)] before:-z-10 before:block",
          "before:h-[var(--pseudo-element-height)] before:w-[var(--pseudo-element-width)] before:rounded-[var(--border-radius)] before:content-['']",
          "before:bg-[linear-gradient(0deg,var(--neon-first-color),var(--neon-second-color))] before:bg-[length:100%_200%]",
          "before:animate-[background-position-spin_3s_infinite_alternate]",
          "after:absolute after:-left-[var(--border-size)] after:-top-[var(--border-size)] after:-z-10 after:block",
          "after:h-[var(--pseudo-element-height)] after:w-[var(--pseudo-element-width)] after:rounded-[var(--border-radius)] after:blur-[var(--after-blur)] after:content-['']",
          "after:bg-[linear-gradient(0deg,var(--neon-first-color),var(--neon-second-color))] after:bg-[length:100%_200%] after:opacity-80",
          "after:animate-[background-position-spin_3s_infinite_alternate]",
        )}
      >
        {children}
      </div>
    </div>
  );
};

// CosmicGlowButton Component com cores NEONPROV1
interface CosmicGlowButtonProps {
  className?: string;
  children?: React.ReactNode;
  color?: string;
  speed?: string;
  onClick?: () => void;
}

const CosmicGlowButton: React.FC<CosmicGlowButtonProps> = ({
  className,
  color,
  speed = "5s",
  children,
  onClick,
}) => {
  const glowColor = color || "#1E40AF"; // NEONPROV1 Primary
  const content = children ?? "Click me";

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative inline-flex items-center justify-center py-3 px-6 rounded-xl font-semibold text-sm cursor-pointer",
        "bg-gradient-to-r from-neon-primary via-neon-secondary to-neon-primary",
        "text-white shadow-lg shadow-neon-primary/20",
        "overflow-hidden transition-all duration-300 hover:scale-105",
        className
      )}
    >
      <span
        className="absolute inset-0 rounded-xl blur-lg opacity-40 animate-[glow-scale_5s_infinite]"
        style={{
          background: `radial-gradient(circle at center, ${glowColor} 10%, transparent 60%)`,
          animationDuration: speed,
          zIndex: 0,
        }}
      />
      <span
        className="absolute inset-0 rounded-xl opacity-20 animate-[glow-slide_5s_infinite_linear]"
        style={{
          background: `conic-gradient(from 90deg at 50% 50%, transparent 0deg, ${glowColor} 120deg, transparent 240deg)`,
          animationDuration: speed,
          zIndex: 0,
        }}
      />
      <span className="relative z-10">{content}</span>
    </button>
  );
};

// Main Advanced Dashboard Component
export default function AdvancedDashboard() {
  const [activeMetric, setActiveMetric] = useState<string | null>(null);

  const metrics = [
    {
      title: "Pacientes Ativos",
      value: "2,847",
      change: "+12.5%",
      trend: "up",
      icon: Users,
      color: "#1E40AF", // NEONPROV1 Primary
      bgColor: "bg-gradient-to-br from-neon-primary/10 to-neon-primary/20"
    },
    {
      title: "Consultas Hoje",
      value: "156",
      change: "+8.2%",
      trend: "up",
      icon: Calendar,
      color: "#3B82F6", // NEONPROV1 Secondary
      bgColor: "bg-gradient-to-br from-neon-secondary/10 to-neon-secondary/20"
    },
    {
      title: "Receita Mensal",
      value: "R$ 127.8k",
      change: "+15.3%",
      trend: "up",
      icon: DollarSign,
      color: "#10B981", // NEONPROV1 Success
      bgColor: "bg-gradient-to-br from-neon-success/10 to-neon-success/20"
    },
    {
      title: "Taxa Satisfação",
      value: "94.8%",
      change: "+2.1%",
      trend: "up",
      icon: Heart,
      color: "#60A5FA", // NEONPROV1 Accent
      bgColor: "bg-gradient-to-br from-neon-accent/10 to-neon-accent/20"
    }
  ];

  const recentPatients = [
    {
      id: 1,
      name: "Maria Silva",
      condition: "Harmonização Facial",
      time: "14:30",
      status: "Em Atendimento",
      priority: "normal"
    },
    {
      id: 2,
      name: "João Santos",
      condition: "Botox Preventivo",
      time: "14:15",
      status: "Aguardando",
      priority: "high"
    },
    {
      id: 3,
      name: "Ana Costa",
      condition: "Limpeza de Pele",
      time: "14:00",
      status: "Finalizado",
      priority: "low"
    },
    {
      id: 4,
      name: "Carlos Oliveira",
      condition: "Preenchimento Labial",
      time: "13:45",
      status: "Reagendado",
      priority: "normal"
    }
  ];

  return (
    <AppLayout>
      <style jsx global>{`
        @keyframes background-position-spin {
          0% { background-position: top center; }
          100% { background-position: bottom center; }
        }
        @keyframes glow-scale {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.15); opacity: 0.7; }
        }
        @keyframes glow-slide {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neon-primary mb-2">Dashboard Avançado NEONPROV1</h1>
            <p className="text-gray-600">Gestão Inteligente para Clínicas de Estética - Premium Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar pacientes..."
                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-neon-primary focus:ring-2 focus:ring-neon-primary/20"
              />
            </div>
            <CosmicGlowButton color="#1E40AF" className="text-sm">
              <Bell className="w-4 h-4 mr-2" />
              Notificações
            </CosmicGlowButton>
          </div>
        </div>

        {/* Premium KPI Cards with Neon Effects */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <NeonGradientCard
                key={metric.title}
                className="h-full"
                neonColors={{
                  firstColor: metric.color,
                  secondColor: metric.color + "80" // Add transparency
                }}
              >
                <div
                  className={cn(
                    "h-full p-6 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer",
                    metric.bgColor
                  )}
                  onMouseEnter={() => setActiveMetric(metric.title)}
                  onMouseLeave={() => setActiveMetric(null)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="p-3 rounded-xl"
                      style={{ backgroundColor: `${metric.color}20` }}
                    >
                      <Icon
                        className="w-6 h-6"
                        style={{ color: metric.color }}
                      />
                    </div>
                    <Badge
                      variant={metric.trend === 'up' ? 'default' : 'destructive'}
                      className="text-xs"
                      style={{ backgroundColor: metric.trend === 'up' ? '#10B981' : '#EF4444', color: 'white' }}
                    >
                      {metric.change}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      {metric.value}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {metric.title}
                    </p>
                  </div>
                  {activeMetric === metric.title && (
                    <div className="mt-4 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-neon-success" />
                      <span className="text-xs text-gray-600">
                        Tendência positiva
                      </span>
                    </div>
                  )}
                </div>
              </NeonGradientCard>
            );
          })}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Patients - Enhanced */}
          <Card className="lg:col-span-2 bg-white border-gray-200 shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Próximas Consultas</h3>
                  <p className="text-sm text-gray-500">Agendamentos para hoje</p>
                </div>
                <CosmicGlowButton
                  color="#1E40AF"
                  className="text-xs py-2 px-4"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Consulta
                </CosmicGlowButton>
              </div>
              
              <div className="space-y-4">
                {recentPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 hover:border-neon-primary/30 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-neon-primary to-neon-secondary flex items-center justify-center shadow-lg">
                        <UserCheck className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{patient.name}</h4>
                        <p className="text-sm text-gray-600">{patient.condition}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">{patient.time}</span>
                      </div>
                      <Badge
                        variant={patient.priority === 'high' ? 'destructive' : 
                                patient.priority === 'normal' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {patient.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <Button variant="outline" className="w-full hover:bg-neon-primary hover:text-white transition-colors">
                  <ChevronRight className="w-4 h-4 mr-2" />
                  Ver Todas as Consultas
                </Button>
              </div>
            </div>
          </Card>

          {/* Quick Actions - Enhanced */}
          <Card className="bg-white border-gray-200 shadow-lg">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Ações Rápidas</h3>
              <div className="space-y-4">
                <CosmicGlowButton
                  color="#1E40AF"
                  className="w-full justify-start"
                >
                  <Calendar className="w-5 h-5 mr-3" />
                  Agendar Consulta
                </CosmicGlowButton>
                <CosmicGlowButton
                  color="#3B82F6"
                  className="w-full justify-start"
                >
                  <Users className="w-5 h-5 mr-3" />
                  Cadastrar Paciente
                </CosmicGlowButton>
                <CosmicGlowButton
                  color="#10B981"
                  className="w-full justify-start"
                >
                  <DollarSign className="w-5 h-5 mr-3" />
                  Registrar Pagamento
                </CosmicGlowButton>
                <CosmicGlowButton
                  color="#60A5FA"
                  className="w-full justify-start"
                >
                  <BarChart3 className="w-5 h-5 mr-3" />
                  Relatórios
                </CosmicGlowButton>
              </div>

              {/* System Status - Enhanced */}
              <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="w-5 h-5 text-neon-primary" />
                  <h4 className="text-sm font-semibold text-gray-900">Status do Sistema</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Servidor Principal</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-neon-success rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium text-neon-success">Online</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Banco de Dados</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-neon-success rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium text-neon-success">Conectado</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Sistema NEONPROV1</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-neon-primary rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium text-neon-primary">Premium Active</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Uptime Sistema</span>
                      <span className="text-xs font-bold text-neon-success">99.9%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Performance Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-neon-primary/5 to-neon-secondary/5 border-neon-primary/20">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-neon-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-neon-primary mb-2">4.9/5</h3>
              <p className="text-sm text-gray-600">Avaliação Média dos Pacientes</p>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-br from-neon-success/5 to-neon-success/10 border-neon-success/20">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-neon-success rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-neon-success mb-2">92%</h3>
              <p className="text-sm text-gray-600">Taxa de Retorno de Pacientes</p>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-br from-neon-accent/5 to-neon-accent/10 border-neon-accent/20">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-neon-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-neon-accent mb-2">87%</h3>
              <p className="text-sm text-gray-600">Eficiência Operacional</p>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}